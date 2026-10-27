"use client";
/**
 * Holds conversations + messages in memory and talks to lib/api.ts.
 * No persistence: refresh = reset (by design, until your backend stores things).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import type { Conversation, Message } from "@/types/chat";

interface ConvStatus {
  loading: boolean;
  error: string | null;
}

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  status: Record<string, ConvStatus>;
  loadMessages: (id: number) => void;
  sendMessage: (id: number | null, text: string) => Promise<number>;
  deleteConversation: (id: number) => Promise<void>;
  retry: (id: number) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}

const newId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [status, setStatus] = useState<Record<string, ConvStatus>>({});
  const msgsRef = useRef<Record<string, Message[]>>({});
  const loaded = useRef(new Set<string>());

  useEffect(() => {
    if (!ready) return;

    let active = true;
    msgsRef.current = {};
    loaded.current.clear();
    setConversations([]);
    setMessages({});
    setStatus({});

    if (!token) return;

    api
      .getConversations()
      .then((list) => {
        if (active) setConversations(list);
      })
      .catch((error: unknown) => {
        if (active) console.error("Failed to load conversations:", error);
      });

    return () => {
      active = false;
    };
  }, [ready, token]);

  const setMsgs = useCallback(
    (id: string, update: (m: Message[]) => Message[]) => {
      msgsRef.current = {
        ...msgsRef.current,
        [id]: update(msgsRef.current[id] ?? []),
      };
      setMessages(msgsRef.current);
    },
    [],
  );

  const setSt = useCallback(
    (id: string, s: ConvStatus) => setStatus((p) => ({ ...p, [id]: s })),
    [],
  );

  const run = useCallback(
    async (id: string) => {
      setSt(id, { loading: true, error: null });

      try {
        const history = (msgsRef.current[id] ?? []).map(
          ({ role, content }) => ({
            role,
            content,
          }),
        );

        const assistantId = newId();

        setMsgs(id, (m) => [
          ...m,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
          },
        ]);

        await api.streamMessage(Number(id), history, (chunk) => {
          setMsgs(id, (messages) =>
            messages.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content + chunk,
                  }
                : message,
            ),
          );
        });

        setSt(id, { loading: false, error: null });

        setConversations((p) =>
          p.map((c) =>
            String(c.id) === id
              ? { ...c, updatedAt: new Date().toISOString() }
              : c,
          ),
        );
      } catch {
        setSt(id, {
          loading: false,
          error: t("auth.genericError"),
        });
      }
    },
    [setMsgs, setSt, t],
  );

  const sendMessage = useCallback(
  async (id: number | null, text: string): Promise<number> => {
    let convId = id;

    if (convId === null) {
      const title =
        text.length > 40 ? text.slice(0, 40) + "…" : text;

      const conversation = await api.createConversation(title);

      convId = conversation.id;

      setConversations((prev) => [conversation, ...prev]);
    }

    const key = String(convId);

    loaded.current.add(key);

    setMsgs(key, (messages) => [
      ...messages,
      {
        id: newId(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);

    void run(key);

    return convId;
  },
  [run, setMsgs],
);
const loadMessages = useCallback(
  (id: number) => {
    const key = String(id);

    if (loaded.current.has(key)) return;

    loaded.current.add(key);
    setSt(key, { loading: true, error: null });

    api
      .getMessages(id)
      .then((fetched) => {
        setMsgs(key, (messages) =>
          messages.length ? messages : fetched,
        );
        setSt(key, { loading: false, error: null });
      })
      .catch(() => {
        loaded.current.delete(key);
        setSt(key, {
          loading: false,
          error: t("chat.loadFailed"),
        });
      });
  },
  [setMsgs, setSt, t],
);

const deleteConversation = useCallback(async (id: number) => {
  await api.deleteConversation(id);

  const key = String(id);
  setConversations((current) => current.filter((conversation) => conversation.id !== id));
  loaded.current.delete(key);
  delete msgsRef.current[key];
  setMessages((current) => {
    const next = { ...current };
    delete next[key];
    return next;
  });
  setStatus((current) => {
    const next = { ...current };
    delete next[key];
    return next;
  });
}, []);

const retry = useCallback(
  (id: number) => {
    void run(String(id));
  },
  [run],
);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        status,
        loadMessages,
        sendMessage,
        deleteConversation,
        retry,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

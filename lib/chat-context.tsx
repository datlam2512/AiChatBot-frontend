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
import type { Conversation, Message } from "@/types/chat";

interface ConvStatus {
  loading: boolean;
  error: string | null;
}

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  status: Record<string, ConvStatus>;
  loadMessages: (id: string) => void;
  /** Pass null to start a new conversation. Returns the conversation id. */
  sendMessage: (id: string | null, text: string) => string;
  retry: (id: string) => void;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [status, setStatus] = useState<Record<string, ConvStatus>>({});
  const msgsRef = useRef<Record<string, Message[]>>({});
  const loaded = useRef(new Set<string>());

  useEffect(() => {
    api
      .getConversations()
      .then((list) =>
        setConversations((prev) => [
          ...prev,
          ...list.filter((c) => !prev.some((p) => p.id === c.id)),
        ]),
      )
      .catch(() => {});
  }, []);

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

        await api.streamMessage(history, (chunk) => {
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
            c.id === id ? { ...c, updatedAt: new Date().toISOString() } : c,
          ),
        );
      } catch {
        setSt(id, {
          loading: false,
          error: "Something went wrong. Please try again.",
        });
      }
    },
    [setMsgs, setSt],
  );

  const sendMessage = useCallback(
    (id: string | null, text: string) => {
      let convId = id;
      if (!convId) {
        convId = newId(); // temporary frontend id
        const now = new Date().toISOString();
        const conv: Conversation = {
          id: convId,
          title: text.length > 40 ? text.slice(0, 40) + "…" : text,
          createdAt: now,
          updatedAt: now,
        };
        setConversations((p) => [conv, ...p]);
        api.createConversation(conv).catch(() => {});
      }
      loaded.current.add(convId);
      setMsgs(convId, (m) => [
        ...m,
        {
          id: newId(),
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
        },
      ]);
      void run(convId);
      return convId;
    },
    [run, setMsgs],
  );

  const loadMessages = useCallback(
    (id: string) => {
      if (loaded.current.has(id)) return;
      loaded.current.add(id);
      api
        .getMessages(id)
        .then((fetched) => setMsgs(id, (m) => (m.length ? m : fetched)))
        .catch(() => loaded.current.delete(id));
    },
    [setMsgs],
  );

  const retry = useCallback(
    (id: string) => {
      void run(id);
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
        retry,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

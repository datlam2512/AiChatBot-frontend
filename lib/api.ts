import type { ChatRequestMessage, Conversation, Message } from "@/types/chat";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ConversationResponse {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MessageResponse {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

function mapConversation(data: ConversationResponse): Conversation {
  return {
    id: data.id,
    title: data.title,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapMessage(data: MessageResponse): Message {
  return {
    id: data.id,
    role: data.role,
    content: data.content,
    createdAt: data.created_at,
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const data = await http<ConversationResponse[]>("/api/conversations");

  return data.map(mapConversation);
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const data = await http<MessageResponse[]>(
    `/api/conversations/${conversationId}/messages`,
  );

  return data.map(mapMessage);
}

export async function createConversation(title: string): Promise<Conversation> {
  const data = await http<ConversationResponse>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  return mapConversation(data);
}

export async function streamMessage(
  conversationId: number,
  messages: ChatRequestMessage[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  if (!res.body) {
    throw new Error("Response body is not readable");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, {
      stream: true,
    });

    if (chunk) onChunk(chunk);
  }

  const remaining = decoder.decode();

  if (remaining) onChunk(remaining);
}

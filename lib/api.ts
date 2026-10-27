import type { ChatRequestMessage, Conversation, Message } from "@/types/chat";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_TOKEN_KEY = "ai-chat-access-token";

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
  const token =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    if (!path.startsWith("/auth/")) notifyUnauthorized(res);
    await throwRequestError(res);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function notifyUnauthorized(response: Response) {
  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(AUTH_TOKEN_KEY)
  ) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
}

async function throwRequestError(response: Response): Promise<never> {
  const body: { detail?: unknown } | null = await response
    .json()
    .catch(() => null);
  const message =
    typeof body?.detail === "string"
      ? body.detail
      : Array.isArray(body?.detail) &&
          body.detail.every(
            (item): item is { msg: string } =>
              typeof item === "object" &&
              item !== null &&
              "msg" in item &&
              typeof item.msg === "string",
          )
        ? body.detail.map((item) => item.msg).join(". ")
      : `Request failed (${response.status})`;

  throw new Error(message);
}

export interface AuthUser {
  id: number;
  email: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function register(email: string, password: string): Promise<AuthUser> {
  return http<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return http<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export { AUTH_TOKEN_KEY };

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

export async function deleteConversation(conversationId: number): Promise<void> {
  await http<void>(`/api/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

export async function streamMessage(
  conversationId: number,
  messages: ChatRequestMessage[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const token =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      messages,
    }),
  });

  if (!res.ok) {
    notifyUnauthorized(res);
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

export interface UploadDocumentResponse {
  message: string;
  document_id: number;
  filename: string;
  pages: number;
}

export async function uploadPdf(
  file: File
): Promise<UploadDocumentResponse> {

  const formData = new FormData();

  formData.append("file", file);

  const token =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(
    `${API_BASE}/api/documents/upload`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );

  if (!response.ok) {
    notifyUnauthorized(response);
    await throwRequestError(response);
  }

  return response.json();
}

export type DocumentItem = {
  id: number;
  filename: string;
  created_at: string;
  chunk_count: number;
};

export async function getAllDocuments(): Promise<DocumentItem[]> {
  return http<DocumentItem[]>("/api/documents");
}

export async function getDocument(documentId: number): Promise<DocumentItem> {
  return http<DocumentItem>(`/api/documents/${documentId}`);
}

export async function deleteDocument(documentId: number): Promise<void> {
  await http<void>(`/api/documents/${documentId}`, {
    method: "DELETE",
  });
}

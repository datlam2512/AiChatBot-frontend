// Frontend-only types. Align these with your FastAPI response models later.
export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string; // ISO string
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape sent to the backend: { messages: ChatRequestMessage[] } */
export interface ChatRequestMessage {
  role: Role;
  content: string;
}

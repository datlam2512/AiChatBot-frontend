// Frontend-only types. Align these with your FastAPI response models later.
export type Role = "user" | "assistant";

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}
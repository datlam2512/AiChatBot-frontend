/**
 * API BOUNDARY — the only file that talks to a backend.
 * UI components never call fetch(); they call these functions (via lib/chat-context.tsx).
 *
 * To connect your FastAPI backend:
 *   1. Set USE_MOCK = false
 *   2. Make sure your server allows CORS from http://localhost:3000
 *   3. Adjust the endpoints / payloads below to match your API
 */
import type { ChatRequestMessage, Conversation, Message } from "@/types/chat";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = false; // TODO: flip to false when your Python backend is ready

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

/**
 * POST /api/chat
 * Request:  { "messages": [{ "role": "user", "content": "Hello" }, ...] }  (full history, newest last)
 * Response: { "message": { "role": "assistant", "content": "..." } }
 */
export async function sendMessage(
  messages: ChatRequestMessage[],
): Promise<ChatRequestMessage> {
  if (USE_MOCK) return mockSendMessage(messages);
  const data = await http<{ message: ChatRequestMessage }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  return data.message;
}

/** GET /api/conversations  ->  Conversation[] */
export async function getConversations(): Promise<Conversation[]> {
  if (USE_MOCK) return mockConversations();
  return http<Conversation[]>("/api/conversations"); // TODO: match your response shape
}

/** GET /api/conversations/{id}/messages  ->  Message[] */
export async function getMessages(conversationId: string): Promise<Message[]> {
  if (USE_MOCK) return mockMessages(conversationId);
  return http<Message[]>(`/api/conversations/${conversationId}/messages`); // TODO
}

/** POST /api/conversations  ->  Conversation  (frontend already generated a temporary id) */
export async function createConversation(
  conversation: Conversation,
): Promise<Conversation> {
  if (USE_MOCK) return conversation;
  return http<Conversation>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(conversation),
  }); // TODO
}

export async function streamMessage(
  messages: ChatRequestMessage[],
  onChunk: (chunk: string) => void,
) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
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

    const chunk = decoder.decode(value, { stream: true });

    if (chunk) {
      onChunk(chunk);
    }
  }
}

/* ------------------------------------------------------------------ */
/* MOCKS — delete everything below when the real backend is connected. */
/* ------------------------------------------------------------------ */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mockSendMessage(
  messages: ChatRequestMessage[],
): Promise<ChatRequestMessage> {
  await sleep(1200);
  const last = messages[messages.length - 1]?.content ?? "";
  if (last.includes("/error"))
    throw new Error("Mock failure (message contained /error)");
  return { role: "assistant", content: mockReply(last) };
}

function mockReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("python")) {
    return [
      "A **class** is a blueprint for creating objects. It bundles data (attributes) and behavior (methods).",
      "",
      "```python",
      "class Dog:",
      "    def __init__(self, name: str):",
      "        self.name = name",
      "",
      "    def bark(self) -> str:",
      '        return f"{self.name} says woof!"',
      "",
      'rex = Dog("Rex")',
      "print(rex.bark())",
      "```",
      "",
      "Key ideas:",
      "- `__init__` runs when you create an instance",
      "- `self` refers to the current object",
      "- Methods are just functions defined inside the class",
    ].join("\n");
  }
  if (t.includes("api")) {
    return 'An **API** (Application Programming Interface) is a contract that lets one program talk to another.\n\nYour frontend sends an HTTP request, the server does some work, and it sends back a response (usually JSON).\n\n```json\n{ "message": { "role": "assistant", "content": "Hello!" } }\n```';
  }
  if (t.includes("llm")) {
    return "A **large language model** predicts the next token given the tokens so far.\n\n1. Text is split into tokens\n2. The model computes probabilities for the next token\n3. One token is picked and appended\n4. Repeat until done\n\nThis is a mocked reply — your Python backend will produce the real one.";
  }
  if (t.includes("rag")) {
    return "**RAG** (Retrieval-Augmented Generation) gives an LLM relevant documents at question time.\n\n1. Embed and store your documents\n2. Retrieve the chunks closest to the question\n3. Put them in the prompt\n4. Let the LLM answer using that context";
  }
  return `This is a **mocked** response to: "${q}"\n\nReplace the mock in \`lib/api.ts\` with a call to your FastAPI backend to get real answers.`;
}

function at(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

function mockConversations(): Conversation[] {
  const c = (id: string, title: string, when: string): Conversation => ({
    id,
    title,
    createdAt: when,
    updatedAt: when,
  });
  return [
    c("mock-1", "Learn Python", minsAgo(5)),
    c("mock-2", "Understanding FastAPI", minsAgo(15)),
    c("mock-3", "AI Engineering", minsAgo(25)),
    c("mock-4", "Machine Learning", at(1, 14)),
    c("mock-5", "What is RAG?", at(1, 9)),
  ];
}

function mockMessages(conversationId: string): Message[] {
  const m = (i: number, role: Message["role"], content: string): Message => ({
    id: `${conversationId}-${i}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  });
  const titles = Object.fromEntries(
    mockConversations().map((c) => [c.id, c.title]),
  );
  const topic = titles[conversationId];
  if (!topic) return [];
  return [
    m(1, "user", `Tell me about: ${topic}`),
    m(
      2,
      "assistant",
      `Here's a short mocked overview of **${topic}**.\n\n- Point one\n- Point two\n- Point three\n\nAsk a follow-up to continue.`,
    ),
  ];
}

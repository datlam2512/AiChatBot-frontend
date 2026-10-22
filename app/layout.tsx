import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChatProvider } from "@/lib/chat-context";
import ChatLayout from "@/components/layout/ChatLayout";

export const metadata: Metadata = { title: "AI Chat", description: "A simple AI chat frontend" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, interactiveWidget: "resizes-content" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          <ChatLayout>{children}</ChatLayout>
        </ChatProvider>
      </body>
    </html>
  );
}

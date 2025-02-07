"use client";

import { Bot, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function Home() {
  // messages: keeps track of all chat messages
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "bot"; content: string }>
  >([
    {
      type: "bot",
      content:
        "Hi! I'm ShopBot 🤖 I can help you find and purchase anything you need. What are you looking for today?",
    },
  ]);

  // Keep track of user input
  const [input, setInput] = useState("");

  // Keep track of loading (i.e., the LLM is "thinking")
  const [loading, setLoading] = useState(false);

  // Store an optional session ID from the backend
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Append the user's message to the conversation locally
    setMessages((prev) => [...prev, { type: "user", content: input }]);

    // Prepare to call the backend
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: input,
        }),
      });
      const data = await res.json();

      // The backend will return something like:
      // { session_id: "...", messages: [{role: "...", content: "..."}] }

      // Update the session ID if new
      setSessionId(data.session_id);

      // Process each returned message
      const newMessages = data.messages.map((m: any) => {
        if (m.role === "assistant" || m.role === "system") {
          return {
            type: "bot",
            content: m.content,
          };
        } else {
          // If the role is user (rare from the server, but possible),
          // you can decide to display or skip it to avoid duplicates.
          return {
            type: "user",
            content: m.content,
          };
        }
      });

      // Append them to our local state
      setMessages((prev) => [...prev, ...newMessages]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message in the UI
    } finally {
      // Clear input box and re-enable
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AgentShop</h1>
          </div>
          <div className="flex items-start justify-center gap-2 text-md">
            <Image
              src="/images/coinbase-wordmark.svg"
              alt="Coinbase Commerce"
              width={140}
              height={32}
            />
            <h1 className="text-2xl font-bold">COMMERCE</h1>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                      }`}
                  >
                    {message.type === "bot" && (
                      <Bot className="w-5 h-5 mb-2" />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-2 text-center text-sm text-gray-500">
            Thinking...
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about shopping..."
            className="rounded-xl"
          />
          <Button disabled={loading} onClick={handleSend} className="rounded-xl">
            {loading ? "Loading..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Bot, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

let hasInitialized = false;

export default function Home() {
  // messages: keeps track of all chat messages
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "bot"; content: string }>
  >([]);

  // Keep track of user input
  const [input, setInput] = useState("");

  // Keep track of loading (i.e., the LLM is "thinking")
  const [loading, setLoading] = useState(false);

  // Store an optional session ID from the backend
  const [sessionId, setSessionId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Whenever messages update, scroll to the bottom.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("Component mounted");
    if (!hasInitialized) {
      hasInitialized = true;
      handleSend();
    }
  }, [])

  const handleSend = async () => {
    // if (!input.trim()) return;

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
        if (m.content === "") return;
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
            <h1 className="text-3xl font-bold">Shop Pal</h1>
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
        <Card className="bg-secondary rounded-xl shadow-lg p-4 mb-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.filter((m) => m.content != "").map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-white"
                      }`}
                  >
                    {message.type === "bot" && (
                      <Bot className="w-5 h-5 mb-2" />
                    )}
                    <p className="text-sm">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          img: ({ node, ...props }) => (
                            <img {...props} style={{ maxWidth: "200px" }} alt={props.alt} />
                          ),
                          hr: ({ node, ...props }) => (<hr {...props} style={{ marginTop: "20px", marginBottom: "20px" }} />),
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            />
                          ),
                        }}>
                        {message.content}
                      </ReactMarkdown>
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="mb-2 flex justify-center items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full"
                      style={{ animation: "blink 1.4s infinite both", animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full"
                      style={{ animation: "blink 1.4s infinite both", animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full"
                      style={{ animation: "blink 1.4s infinite both", animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>


        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tell me about what product you want to buy..."
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

"use client";

import { Bot, ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([
    { type: 'bot', content: 'Hi! I\'m ShopBot 🤖 I can help you find and purchase anything you need. What are you looking for today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'I\'ll help you find that! Let me search through our catalog...'
      }]);
    }, 1000);
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
            <Image src="./images/coinbase-wordmark.svg" alt="Coinbase Commerce" width={140} height={32} />
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
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                      }`}
                  >
                    {message.type === 'bot' && (
                      <Bot className="w-5 h-5 mb-2" />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about shopping..."
            className="rounded-xl"
          />
          <Button onClick={handleSend} className="rounded-xl">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

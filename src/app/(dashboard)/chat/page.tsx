"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionIcons } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useChatStore } from "@/store";
import { speakText } from "@/services/ttsService";

export default function ChatPage() {
  const { messages, loading, sendMessage, clearMessages } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (prevMessageCountRef.current !== messages.length) {
      scrollToBottom();
      prevMessageCountRef.current = messages.length;
    }
  });

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  const handleSpeakMessage = (content: string) => {
    speakText(content);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      clearMessages();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RADA Intelligent Assistant</h1>
          <p className="text-muted-foreground">Ask anything about droughts and floods in Baringo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
          >
            <ActionIcons.Delete className="mr-2 h-4 w-4" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="pb-3">
          <CardTitle>RADA Intelligent Assistant</CardTitle>
          <CardDescription>
            Ask me about weather forecasts, alerts, or disaster conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pr-4 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="text-muted-foreground max-w-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-sm mb-6">
                    Ask me questions about the disaster forecast, alerts or disaster conditions in Baringo, KE.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => sendMessage("What are risks associated with floods?")}
                    >
                      Flash floods risks
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => sendMessage("How can I prepare for upcoming dry spells")}
                    >
                      Prepare for droughts
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => sendMessage("What insights can we gain from the current disaster forecast?")}
                    >
                      Forecasts insights
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => sendMessage("Are there any disaster alerts?")}
                    >
                      Any disaster alerts?
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onSpeakMessage={handleSpeakMessage}
                  />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 mt-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 w-2/3 rounded-lg" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about the weather..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !inputValue.trim()}
            >
              <ActionIcons.Next className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={loading}
              onClick={() => console.log("Voice input not implemented yet")}
            >
              <ActionIcons.Mic className="h-4 w-4" />
              <span className="sr-only">Voice Input</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

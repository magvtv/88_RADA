"use client";

import type { ChatMessage as ChatMessageType } from "@/types/nlpResponse";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActionIcons } from "@/components/ui/icons";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeakMessage?: (content: string) => void;
  translation?: string | null;
}

export function ChatMessage({ message, onSpeakMessage, translation }: ChatMessageProps) {
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Format timestamp to relative time
  const formattedTime = formatRelative(
    new Date(message.timestamp),
    new Date()
  );

  const isUser = message.role === "user";

  // Get initials for avatar
  const getInitials = () => (isUser ? "U" : "A");

  const handleSpeakMessage = () => {
    if (onSpeakMessage) {
      onSpeakMessage(message.content);
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(prev => !prev);
  };

  // Content to display (either original message or translation)
  const displayContent = showTranslation && translation ? translation : message.content;

  return (
    <div
      className={cn(
        "flex gap-2 mb-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setIsActionsVisible(true)}
      onMouseLeave={() => setIsActionsVisible(false)}
      onTouchStart={() => setIsActionsVisible(true)}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 relative",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted rounded-tl-none"
        )}
      >
        <div className="text-sm prose dark:prose-invert prose-sm max-w-none">
          {isUser ? (
            <p>{displayContent}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          )}
        </div>
        <span className="text-xs opacity-70 mt-1 block">{formattedTime}</span>

        {/* Actions (only for assistant messages) */}
        {!isUser && isActionsVisible && (
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Play TTS button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSpeakMessage}
              aria-label="Listen to message"
            >
              <ActionIcons.Mic className="h-3 w-3" />
            </Button>
            
            {/* Translation toggle button - only show if translation is available */}
            {translation && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleTranslation}
                aria-label={showTranslation ? "Show original" : "Show translation"}
              >
                <ActionIcons.Globe className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

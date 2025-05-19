import { create } from "zustand";
import { type ChatState, ChatMessage, NLPResponse } from "@/types/nlpResponse";
import {
  sendChatQuery,
  sendVoiceQuery,
  createUserMessage,
  createAssistantMessage,
} from "@/services/nlpService";

interface ChatActions {
  // Actions
  sendMessage: (content: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  messages: [],
  loading: false,
  error: null,
  translations: {},

  // Actions
  sendMessage: async (content: string) => {
    try {
      // Create and add user message
      const userMessage = createUserMessage(content);

      set((state) => ({
        messages: [...state.messages, userMessage],
        loading: true,
        error: null,
      }));

      // Send to API and get response
      const response = await sendChatQuery(content);

      // Create and add assistant message
      const assistantMessage = createAssistantMessage(response.answer);

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to process chat message:", error);

      // Create an error message from the assistant
      const errorMessage = createAssistantMessage(
        "Sorry, I couldn't process your message. Please try again later."
      );

      set((state) => ({
        messages: [...state.messages, errorMessage],
        loading: false,
        error: "Failed to process chat message",
      }));
    }
  },

  sendVoiceMessage: async (audioBlob: Blob) => {
    try {
      set((state) => ({
        // Add a temporary user message for the voice input
        messages: [
          ...state.messages,
          createUserMessage("🎤 Voice message..."),
        ],
        loading: true,
        error: null,
      }));

      // Send voice data to API and get response
      const response = await sendVoiceQuery(audioBlob);

      // Replace the temporary message with the actual transcription
      // and add the assistant's response
      set((state) => {
        // Get all messages except the last one (the temporary message)
        const messagesWithoutTemp = state.messages.slice(0, -1);

        return {
          messages: [
            ...messagesWithoutTemp,
            createUserMessage(`🎤 "${response.answer}"`), // Use answer as transcription
            createAssistantMessage(response.answer),
          ],
          loading: false,
        };
      });
    } catch (error) {
      console.error("Failed to process voice message:", error);

      // Create an error message from the assistant
      const errorMessage = createAssistantMessage(
        "Sorry, I couldn't process your voice message. Please try again or type your message."
      );

      set((state) => {
        // Get all messages except the last one (the temporary message)
        const messagesWithoutTemp = state.messages.slice(0, -1);

        return {
          messages: [...messagesWithoutTemp, errorMessage],
          loading: false,
          error: "Failed to process voice message",
        };
      });
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      error: null,
    });
  },
}));

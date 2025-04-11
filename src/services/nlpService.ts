import { apiPost } from "./api";
import type { NLPResponse, ChatMessage } from "@/types/nlpResponse";
import { v4 as uuidv4 } from "uuid";

const ENDPOINTS = {
  chatQuery: "/nlp/chat",
  voiceQuery: "/nlp/voice",
};

// Mock data for development
const mockChatResponses: Record<string, NLPResponse> = {
  default: {
    answer: "I don't have specific information about that. Would you like to know about the current weather forecast instead?",
    confidence: 0.5,
    relatedQuestions: [
      "What's the weather like today?",
      "Will it rain this week?",
      "What's the temperature for tomorrow?"
    ],
  },
  weather: {
    answer: "The weather today is sunny with a high of 25°C. There's a slight chance of rain in the evening.",
    confidence: 0.9,
    forecasts: [
      { date: "2025-04-11", summary: "Sunny, 25°C" },
      { date: "2025-04-12", summary: "Partly Cloudy, 27°C" }
    ],
  },
  rain: {
    answer: "There is a 40% chance of rain on Sunday. The rest of the week looks mostly clear.",
    confidence: 0.85,
    forecasts: [
      { date: "2025-04-13", summary: "Rainy, 22°C" },
    ],
  },
  hello: {
    answer: "Hello! How can I help you with weather information today?",
    confidence: 0.95,
    relatedQuestions: [
      "What's the weather forecast?",
      "Will it rain today?",
      "What's the temperature right now?"
    ],
  },
};

// Helper function to determine which mock response to use
function getMockResponse(query: string): NLPResponse {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("weather") || lowerQuery.includes("forecast") || lowerQuery.includes("temperature")) {
    return mockChatResponses.weather;
  }

  if (lowerQuery.includes("rain") || lowerQuery.includes("precipitation")) {
    return mockChatResponses.rain;
  }

  if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
    return mockChatResponses.hello;
  }

  return mockChatResponses.default;
}

// Service functions
export async function sendChatQuery(query: string): Promise<NLPResponse> {
  try {
    // In a real implementation, this would call the API
    // return await apiPost<NLPResponse>(ENDPOINTS.chatQuery, { query });

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockResponse(query));
      }, 1000);
    });
  } catch (error) {
    console.error("Failed to process chat query:", error);
    throw error;
  }
}

export async function sendVoiceQuery(audioData: Blob): Promise<NLPResponse> {
  try {
    // In a real implementation, this would call the API with FormData
    // const formData = new FormData();
    // formData.append('audio', audioData);
    // return await apiPost<NLPResponse>(ENDPOINTS.voiceQuery, formData);

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate that we've extracted "weather forecast" from the audio
        resolve(mockChatResponses.weather);
      }, 1500);
    });
  } catch (error) {
    console.error("Failed to process voice query:", error);
    throw error;
  }
}

// Function to create a new chat message (client-side only)
export function createUserMessage(content: string): ChatMessage {
  return {
    id: uuidv4(),
    content,
    role: "user",
    timestamp: new Date().toISOString(),
  };
}

export function createAssistantMessage(content: string): ChatMessage {
  return {
    id: uuidv4(),
    content,
    role: "assistant",
    timestamp: new Date().toISOString(),
  };
}

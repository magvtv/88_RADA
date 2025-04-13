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
    answer: "I don't have specific information about that. Would you like to know about the current disaster forecast instead?",
    confidence: 0.5,
    relatedQuestions: [
      "How can I prepare for upcoming flash floods?",
      "What are some disaster actionable insights ",
      "What are the current disaster forecasts?",
      "Share signs of impending drought",
    ],
  },
  drought: {
    answer: "Current dry spell conditions in Baringo: Marigat region experiencing severe drought with water sources depleting. Kabarnet area facing moderate dry conditions affecting crop yields. Eastern parts showing early signs of drought stress with reduced vegetation.",
    confidence: 0.9,
    forecasts: [
      { date: "2025-04-11", summary: "Continued dry conditions, no precipitation expected" },
      { date: "2025-04-12", summary: "Partly cloudy, minimal chance of rainfall" },
      { date: "2025-04-13", summary: "Increasing wind patterns, dust advisories in effect" }
    ],
  },
  flood: {
    answer: "Current flood situation in Baringo: Lake Baringo has risen significantly, displacing communities along the shoreline. Marigat area experiencing flash floods due to heavy upstream rainfall. Kabarnet region reporting minor flooding in low-lying areas with several roads becoming impassable.",
    confidence: 0.85,
    forecasts: [
      { date: "2025-04-13", summary: "Heavy rainfall expected, flood warnings in effect" },
      { date: "2025-04-14", summary: "Continued precipitation, risk of landslides in hilly areas" },
      { date: "2025-04-15", summary: "Gradual reduction in rainfall, but waterlogged areas remain hazardous" }
    ],
  },
  hello: {
    answer: "Hello! How can I help you with learning about disasters today?",
    confidence: 0.95,
    relatedQuestions: [
      "What are the current disaster forecasts for Baringo?",
      "How can I prepare for potential floods in Baringo?",
      "Are there any drought warnings for Marigat region?",
      "What emergency resources are available in Kabarnet area?"
    ],
  },
};

// Helper function to determine which mock response to use
function getMockResponse(query: string): NLPResponse {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("drought") || lowerQuery.includes("forecast") || lowerQuery.includes("dry spell")) {
    return mockChatResponses.weather;
  }

  if (lowerQuery.includes("flood") || lowerQuery.includes("forecast") || lowerQuery.includes("rain")) {
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

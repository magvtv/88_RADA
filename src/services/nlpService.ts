import type { NLPResponse, ChatMessage } from "@/types/nlpResponse";
import { v4 as uuidv4 } from "uuid";
import { queryRunpod } from "./runpodService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const USE_RUNPOD = process.env.NEXT_PUBLIC_USE_RUNPOD === "true";

const ENDPOINTS = {
  chatQuery: `${API_URL}/nlp/chat`,
  voiceQuery: `${API_URL}/nlp/voice`,
};

// Mock data for development and fallback
const mockChatResponses: Record<string, NLPResponse> = {
  default: {
    answer: "I don't have specific information about that. Would you like to know about the **current disaster forecast** instead?",
    confidence: 0.5,
    relatedQuestions: [
      "How can I prepare for upcoming flash floods?",
      "What are some disaster actionable insights ",
      "What are the current disaster forecasts?",
      "Share signs of impending drought",
    ],
  },
  drought: {
    answer: "**Current dry spell conditions in Baringo:**\n\n- **Marigat region**: Experiencing **severe drought** with water sources depleting.\n- **Kabarnet area**: Facing moderate dry conditions affecting crop yields.\n- **Eastern parts**: Showing early signs of drought stress with reduced vegetation.",
    confidence: 0.9,
    forecasts: [
      { date: "2025-04-11", summary: "Continued dry conditions, no precipitation expected" },
      { date: "2025-04-12", summary: "Partly cloudy, minimal chance of rainfall" },
      { date: "2025-04-13", summary: "Increasing wind patterns, dust advisories in effect" }
    ],
  },
  flood: {
    answer: "**Current flood situation in Baringo:**\n\n1. Lake Baringo has risen significantly, displacing communities along the shoreline.\n2. Marigat area experiencing **flash floods** due to heavy upstream rainfall.\n3. Kabarnet region reporting minor flooding in low-lying areas with several roads becoming impassable.",
    confidence: 0.85,
    forecasts: [
      { date: "2025-04-13", summary: "Heavy rainfall expected, flood warnings in effect" },
      { date: "2025-04-14", summary: "Continued precipitation, risk of landslides in hilly areas" },
      { date: "2025-04-15", summary: "Gradual reduction in rainfall, but waterlogged areas remain hazardous" }
    ],
  },
  hello: {
    answer: "Hello! How can I help you with learning about disasters today? Here are some topics I can assist with:\n\n- Current disaster forecasts for Baringo\n- Preparation for potential floods or droughts\n- Historical disaster patterns in the region\n- Early warning signs to watch for",
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

  if (lowerQuery.includes("drought") || lowerQuery.includes("dry spell")) {
    return mockChatResponses.drought;
  }

  if (lowerQuery.includes("flood") || lowerQuery.includes("rain")) {
    return mockChatResponses.flood;
  }

  if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
    return mockChatResponses.hello;
  }

  return mockChatResponses.default;
}

// Service functions
export async function sendChatQuery(query: string): Promise<NLPResponse> {
  try {
    // Try to use RunPod if enabled, otherwise use the local API
    try {
      if (USE_RUNPOD) {
        console.log(`Using RunPod for query: ${query}`);
        try {
          const response = await queryRunpod(query);
          console.log("RunPod response processed:", response);
          return response;
        } catch (error) {
          console.error("RunPod processing failed, falling back to mock data:", error);
          // Don't throw - continue to fallback options
          // But show a warning in the response
          const mockResponse = getMockResponse(query);
          mockResponse.answer = "⚠️ *RunPod is currently busy processing your request.* Here's a general response while you wait:\n\n" + mockResponse.answer;
          return mockResponse;
        }
      }
      
      console.log(`Sending request to ${ENDPOINTS.chatQuery}`);
      
      const response = await fetch(ENDPOINTS.chatQuery, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      // Format response text to proper markdown
      const formatMarkdown = (text: string): string => {
        // Replace **text** with proper markdown bold
        return text
          // Make sure double asterisks work for bold
          .replace(/\*\*(.*?)\*\*/g, '**$1**')
          // Ensure that single asterisks on each side are properly formatted for italics
          .replace(/\*([^*]+)\*/g, '*$1*')
          // Make sure lists with dashes are properly formatted
          .replace(/^- /gm, '- ')
          // Ensure numbers in lists are properly formatted
          .replace(/^(\d+)\. /gm, '$1. ');
      };
      
      // The backend returns data in a different format than our NLPResponse,
      // so we need to adapt it
      if (data.english && data.swahili) {
        // If we got a bilingual response, format it to match NLPResponse with markdown formatting
        return {
          answer: formatMarkdown(data.english),
          confidence: data.confidence || 0.8,
          translations: {
            swahili: formatMarkdown(data.swahili)
          },
          sources: data.sources || [],
          relatedQuestions: data.relatedQuestions || []
        };
      } else if (data.answer) {
        // If we got a direct NLPResponse format, apply markdown formatting
        return {
          ...data,
          answer: formatMarkdown(data.answer)
        };
      } else {
        // If we got some other format, try to adapt it with markdown formatting
        return {
          answer: formatMarkdown(data.english || data.text || data.content || data.message || "I received a response but couldn't parse it properly."),
          confidence: data.confidence || 0.5
        };
      }
    } catch (error) {
      console.warn("Failed to reach API, falling back to mock data:", error);
      // Fall back to mock data if API is unavailable
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockResponse = getMockResponse(query);
          // Format the mock response with markdown as well
          mockResponse.answer = mockResponse.answer
            .replace(/\*\*(.*?)\*\*/g, '**$1**')
            .replace(/\*([^*]+)\*/g, '*$1*')
            .replace(/^- /gm, '- ')
            .replace(/^(\d+)\. /gm, '$1. ');
          resolve(mockResponse);
        }, 1000);
      });
    }
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
        resolve(mockChatResponses.drought);
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

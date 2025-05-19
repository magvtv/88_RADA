export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface NLPResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  relatedQuestions?: string[];
  forecasts?: {
    date: string;
    summary: string;
  }[];
  translations?: {
    swahili?: string;
    [key: string]: string | undefined;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

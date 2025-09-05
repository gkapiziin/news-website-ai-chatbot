import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5298/api';

export interface ChatBotRequest {
  message: string;
  language: string;
  sessionId?: string;
}

export interface ChatBotResponse {
  content: string;
  sources?: Source[];
  articleLink?: string;
  sessionId: string;
}

export interface Source {
  title: string;
  url: string;
  reliability: 'high' | 'medium';
  snippet?: string;
}

class NewChatBotService {
  private baseURL = `${API_BASE_URL}/chatbot`;
  private sessionId?: string;

  async processMessage(message: string, language: string): Promise<ChatBotResponse> {
    try {
      const response = await axios.post<ChatBotResponse>(`${this.baseURL}/process`, {
        message,
        language,
        sessionId: this.sessionId,
      });

      if (response.data.sessionId) {
        this.sessionId = response.data.sessionId;
      }

      return response.data;
    } catch (error) {
      console.error('Error processing ChatBot message:', error);
      throw error;
    }
  }

  async createSession(): Promise<string> {
    try {
      const response = await axios.post<{ sessionId: string }>(`${this.baseURL}/session`);
      this.sessionId = response.data.sessionId;
      return response.data.sessionId;
    } catch (error) {
      console.error('Error creating ChatBot session:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await axios.delete(`${this.baseURL}/session/${this.sessionId}`);
      this.sessionId = undefined;
    } catch (error) {
      console.error('Error ending ChatBot session:', error);
    }
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }
}

export const newChatBotService = new NewChatBotService();

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const conversations: { [chatId: string]: ChatMessage[] } = {};
export const pendingMessages: { [chatId: string]: string } = {};

export function accumulateMessage(chatId: string, message: string): void {
  if (pendingMessages[chatId]) {
    pendingMessages[chatId] += "\n" + message;
  } else {
    pendingMessages[chatId] = message;
  }
} 
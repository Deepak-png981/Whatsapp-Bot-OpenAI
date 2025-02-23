import OpenAI from 'openai';
import { ChatMessage } from '../utils/chatUtils';
import { handleOpenAIError } from '../utils/errorHandler';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export async function processMessage(chatId: string, conversations: { [chatId: string]: ChatMessage[] }, pendingMessages: { [chatId: string]: string }): Promise<string> {
  if (!conversations[chatId]) {
    conversations[chatId] = [getInitialSystemMessage()];
  }

  if (pendingMessages[chatId]) {
    conversations[chatId].push({ role: 'user', content: pendingMessages[chatId] });
    delete pendingMessages[chatId];
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversations[chatId],
    });

    const reply = chatCompletion.choices[0].message.content;
    conversations[chatId].push({ role: 'assistant', content: reply ? reply : '' });

    return reply ? reply.trim() : '';
  } catch (error: any) {
    handleOpenAIError(error);
    return 'क्षमा करें, कुछ गलत हो गया।';
  }
}

function getInitialSystemMessage(): ChatMessage {
  return {
    role: 'system',
    content:
      "You are a personal Bot of Deepak Joshi, designed to reply on WhatsApp on his behalf. Do not let the sender know that this is a bot. Deepak is known for his humor, sarcasm, and positivity. He is currently a third-year B.Tech IT student at GGSIPU. Please respond in Hinglish using emojis and mimic Deepak's style.",
  };
} 
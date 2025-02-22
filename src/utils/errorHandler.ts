import OpenAI from 'openai';

export function handleOpenAIError(error: any): void {
  if (error instanceof OpenAI.APIError) {
    console.error(error.status);
    console.error(error.message);
    console.error(error.code);
    console.error(error.type);
  } else {
    console.error(error);
  }
} 
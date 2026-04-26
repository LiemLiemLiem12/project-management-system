import { registerAs } from '@nestjs/config';

export default registerAs('Rag', () => ({
  ApiKey: process.env.AI_API_KEY,
  chatModel: process.env.CHAT_MODEL,
  embeddingModel: process.env.EMBEDDING_MODEL,
}));

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyC_wULsdpE8f4AP1s1GcJfK_1yCzfcrHWw');

// Fallback chain: try models in order if quota is hit
const MODELS = ['gemma-3-27b-it', 'gemma-3-12b-it', 'gemini-2.5-flash'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildSystemPrompt = (context) => {
  return `You are a mystical and knowledgeable astrology assistant. You provide personalized horoscope readings, zodiac insights, compatibility analysis, and spiritual guidance.

User details:
- Name: ${context.name || 'Unknown'}
- Zodiac Sign: ${context.sign || 'Unknown'}
- Birth Date: ${context.birthDate || 'Unknown'}
- Gender: ${context.sex || 'Unknown'}
- Relationship Status: ${context.relationship || 'Unknown'}
- Lucky Number: ${context.number || 'Unknown'}

Guidelines:
- Always personalize responses based on the user's zodiac sign and details.
- Be warm, encouraging, and mystical in tone.
- Provide actionable advice when possible.
- Keep responses concise but insightful (2-4 paragraphs max).
- If asked about compatibility, consider both zodiac signs' traits.
- You can discuss daily horoscopes, love, career, health, and spiritual growth.`;
};

export const sendMessageToGemini = async (message, context, history = []) => {
  const systemPrompt = buildSystemPrompt(context);
  const chatHistory = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'model',
      parts: [
        {
          text: `Hello ${context.name || 'there'}! I am your personal astrology assistant. As a ${context.sign || 'cosmic being'}, I can help you understand your daily horoscope, compatibility, and more. What would you like to know?`,
        },
      ],
    },
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  ];

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch (err) {
        const is429 =
          err.message?.includes('429') || err.message?.includes('quota');
        if (is429 && attempt === 0) {
          await sleep(3000);
          continue;
        }
        if (is429) {
          break; // try next model
        }
        throw err; // non-quota error, throw immediately
      }
    }
  }

  throw new Error('AI service is temporarily busy. Please try again shortly.');
};

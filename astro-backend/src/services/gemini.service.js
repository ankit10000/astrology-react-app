const { generateWithRetry } = require('../config/gemini');

const SYSTEM_CONTEXT = `You are a wise and mystical astrology assistant for the Astrale app.
You provide personalized astrological guidance based on the user's zodiac sign and birth details.
Keep responses warm, insightful, and grounded in astrological tradition.
Never provide medical, legal, or financial advice.
Keep responses concise (under 200 words for chat, under 300 words for daily horoscopes).`;

async function generateChatResponse(userMessage, userContext, lang = 'en') {
  const langInstruction = lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';

  const prompt = `${SYSTEM_CONTEXT}

User's astrological profile:
- Name: ${userContext.name}
- Zodiac Sign: ${userContext.sign}
- Birth Date: ${userContext.birthDate ? new Date(userContext.birthDate).toLocaleDateString() : 'Unknown'}
- Sex: ${userContext.sex || 'Unknown'}
- Relationship Status: ${userContext.relationship || 'Unknown'}
- Lucky Number: ${userContext.number || 'Unknown'}

${langInstruction}

User's message: ${userMessage}

Respond in a personalized way based on their astrological profile:`;

  return generateWithRetry(prompt);
}

async function generateDailyHoroscope(sign, userContext, lang = 'en') {
  const langInstruction = lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const prompt = `${SYSTEM_CONTEXT}

Generate a personalized daily horoscope for today (${today}) for a ${sign}.
${userContext ? `User details: Name: ${userContext.name}, Relationship: ${userContext.relationship}` : ''}

${langInstruction}

Return a JSON object with this exact structure:
{
  "focus": "<one word focus area like: Love, Career, Health, Fitness, Study, Social, Creativity>",
  "percents": { "love": <0-100>, "work": <0-100>, "health": <0-100> },
  "text": "<150-250 word personalized horoscope>",
  "compatibility": ["<sign1>", "<sign2>", "<sign3>"],
  "numbers": [<num1>, <num2>, <num3>]
}

Return ONLY valid JSON, no markdown formatting.`;

  const text = await generateWithRetry(prompt);
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

async function generateCompatibility(sign1, sign2, lang = 'en') {
  const langInstruction = lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';

  const prompt = `${SYSTEM_CONTEXT}

Generate a detailed compatibility analysis between ${sign1} and ${sign2}.

${langInstruction}

Return a JSON object with this exact structure:
{
  "resume": "<100-150 word overview of the compatibility>",
  "relationship": "<100-150 word relationship analysis>",
  "percents": {
    "intimate": <0-100>,
    "mindset": <0-100>,
    "feelings": <0-100>,
    "priorities": <0-100>,
    "interests": <0-100>,
    "sport": <0-100>
  }
}

Return ONLY valid JSON, no markdown formatting.`;

  const text = await generateWithRetry(prompt);
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

module.exports = { generateChatResponse, generateDailyHoroscope, generateCompatibility };

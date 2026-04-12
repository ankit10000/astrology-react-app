const { generateWithRetry } = require('../config/azure-openai');

const SYSTEM_CONTEXT = `You are a wise and mystical astrology assistant for the Rashyn app.
You provide personalized astrological guidance based on the user's zodiac sign and birth details.
Keep responses warm, insightful, and grounded in astrological tradition.
Never provide medical, legal, or financial advice.
Keep responses concise (under 200 words for chat, under 300 words for daily horoscopes).`;

async function generateChatResponse(userMessage, userContext, lang = 'en') {
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';

  const prompt = `${SYSTEM_CONTEXT}

User's astrological profile:
- Name: ${userContext.name}
- Zodiac Sign: ${userContext.sign}
- Birth Date: ${userContext.birthDate ? new Date(userContext.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
- Sex: ${userContext.sex || 'Unknown'}
- Relationship Status: ${userContext.relationship || 'Unknown'}
- Lucky Number: ${userContext.number || 'Unknown'}

${langInstruction}

User's message: ${userMessage}

Respond in a personalized way based on their astrological profile:`;

  return generateWithRetry(prompt);
}

async function generateDailyHoroscope(sign, userContext, lang = 'en') {
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';
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
  "focus": "<MUST be exactly one of: Love, Career, Health, Fitness, Study, Social, Creativity>",
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
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';

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

async function generateBirthChart(sign, birthDate, lang = 'en') {
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';
  const formattedDate = new Date(birthDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const prompt = `${SYSTEM_CONTEXT}

Generate a Vedic astrology birth chart interpretation for someone born on ${formattedDate} with Sun sign ${sign}.

${langInstruction}

Return a JSON object with this exact structure:
{
  "ascendant": "<Lagna/Ascendant sign name and 40-60 word meaning>",
  "moonSign": "<Moon sign name and 40-60 word emotional profile>",
  "sunSign": "<Sun sign ${sign} and 40-60 word core identity>",
  "nakshatra": "<Birth Nakshatra name and 40-60 word traits>",
  "planetaryHighlights": [
    { "planet": "<planet name>", "placement": "<sign or house>", "effect": "<30-40 word effect>" },
    { "planet": "<planet name>", "placement": "<sign or house>", "effect": "<30-40 word effect>" },
    { "planet": "<planet name>", "placement": "<sign or house>", "effect": "<30-40 word effect>" }
  ],
  "lifeTheme": "<100-120 word overall life theme and soul purpose>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "challenges": ["<challenge 1>", "<challenge 2>"]
}

Return ONLY valid JSON, no markdown formatting.`;

  const text = await generateWithRetry(prompt);
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

async function generatePanchang(date, lang = 'en') {
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const prompt = `${SYSTEM_CONTEXT}

Generate the Hindu Panchang (Vedic almanac) for ${formattedDate}.

${langInstruction}

Return a JSON object with this exact structure:
{
  "tithi": { "name": "<tithi name e.g. Ekadashi>", "description": "<30-40 word meaning>" },
  "nakshatra": { "name": "<nakshatra name>", "deity": "<ruling deity>", "description": "<30-40 word traits>" },
  "yoga": { "name": "<yoga name e.g. Shubha>", "description": "<30-40 word effect on the day>" },
  "karana": { "name": "<karana name>", "description": "<20-30 word meaning>" },
  "var": { "day": "<weekday in English>", "rulingPlanet": "<planet name>", "description": "<20-30 word day quality>" },
  "rahuKaal": { "start": "<e.g. 09:00 AM>", "end": "<e.g. 10:30 AM>", "warning": "<20-30 word avoidance tip>" },
  "auspicious": ["<activity 1>", "<activity 2>", "<activity 3>"],
  "inauspicious": ["<activity 1>", "<activity 2>"],
  "dayQuality": "<overall 50-60 word summary of the day's energy>"
}

Return ONLY valid JSON, no markdown formatting.`;

  const text = await generateWithRetry(prompt);
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

async function generateRemedies(sign, lang = 'en') {
  const langInstruction =
    lang === 'es' ? 'Respond in Spanish.' : 'Respond in English.';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const prompt = `${SYSTEM_CONTEXT}

Generate Vedic astrology remedies for a ${sign} for today (${today}).

${langInstruction}

Return a JSON object with this exact structure:
{
  "mantra": { "text": "<the mantra in Sanskrit>", "transliteration": "<romanized>", "meaning": "<English meaning>", "repetitions": <number like 108>, "benefit": "<30-40 word benefit>" },
  "ritual": { "title": "<ritual name>", "steps": ["<step 1>", "<step 2>", "<step 3>"], "timing": "<best time to perform e.g. Sunrise>" },
  "gemstone": { "name": "<gemstone>", "planet": "<ruling planet>", "howToWear": "<finger and metal>", "benefit": "<30-40 word benefit>" },
  "donation": { "item": "<what to donate>", "day": "<best day>", "recipient": "<who to give to>", "benefit": "<20-30 word benefit>" },
  "color": "<auspicious color for today>",
  "direction": "<auspicious direction e.g. East>",
  "affirmation": "<a powerful 15-20 word daily affirmation for this sign>"
}

Return ONLY valid JSON, no markdown formatting.`;

  const text = await generateWithRetry(prompt);
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

module.exports = {
  generateChatResponse,
  generateDailyHoroscope,
  generateCompatibility,
  generateBirthChart,
  generatePanchang,
  generateRemedies,
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback chain: gemma-3 models work in all regions, gemini models are geo-restricted
const MODELS = ['gemma-3-27b-it', 'gemma-3-12b-it', 'gemini-2.5-flash'];

const getModel = (modelName) => genAI.getGenerativeModel({ model: modelName });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call Gemini with automatic retry + model fallback on quota errors
 */
const generateWithRetry = async (prompt, maxRetries = 2) => {
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = getModel(modelName);
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        const is429 =
          err.message?.includes('429') || err.message?.includes('quota');
        const isUnsupported =
          err.message?.includes('not supported') ||
          err.message?.includes('not found') ||
          err.message?.includes('not available');
        if (isUnsupported) {
          console.log(`Model ${modelName} not available, trying next...`);
          break;
        }
        if (is429 && attempt < maxRetries) {
          const delay = (attempt + 1) * 5000;
          console.log(
            `Rate limited on ${modelName}, retrying in ${delay / 1000}s...`
          );
          await sleep(delay);
          continue;
        }
        if (is429) {
          console.log(`Quota exhausted for ${modelName}, trying next model...`);
          break;
        }
        // Non-quota error, throw immediately
        throw err;
      }
    }
  }
  throw new Error('All Gemini models quota exhausted. Please try again later.');
};

module.exports = { genAI, generateWithRetry };

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_MODEL = process.env.AZURE_OPENAI_MODEL;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(AZURE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_KEY,
        },
        body: JSON.stringify({
          model: AZURE_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (res.status === 429 && attempt < maxRetries) {
        const delay = (attempt + 1) * 5000;
        console.log(`Rate limited, retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Azure OpenAI error ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep((attempt + 1) * 3000);
    }
  }
};

module.exports = { generateWithRetry };

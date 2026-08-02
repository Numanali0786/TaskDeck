import OpenAI from "openai";
import { ApiError } from "../utils/ApiError.js";

let client = null;

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      503,
      "Groq API key is not configured. Add GROQ_API_KEY to the backend .env file.",
    );
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
};

const MODEL = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export const isAIConfigured = () => Boolean(process.env.GROQ_API_KEY);

const generateJSON = async (prompt) => {
  const ai = getClient();
  try {
    const response = await ai.chat.completions.create({
      model: MODEL(),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that responds strictly in valid JSON format matching the user's request. Do not include markdown code blocks like ```json in your response, just return the raw JSON string.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error("Groq JSON error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again in a moment.");
  }
};

const generateText = async (prompt, temperature = 0.7) => {
  const ai = getClient();
  try {
    const response = await ai.chat.completions.create({
      model: MODEL(),
      messages: [{ role: "user", content: prompt }],
      temperature,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq text error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again in a moment.");
  }
};

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

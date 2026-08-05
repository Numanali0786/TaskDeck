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

    console.log("generateJSON", response);
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
    console.log("generateText", response);
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq text error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again in a moment.");
  }
};

export const generateLeadSummary = async (lead) => {
  const prompt = `You are an expert B2B sales analyst for a CRM called APEX AI CRM.
  Analyze the following sales lead and produce a concise assessment.

  Lead details:
  - Name: ${lead.name || "N/A"}
  - Company: ${lead.company || "N/A"}
- Email: ${lead.email || "N/A"}
- Current pipeline stage: ${lead.status || "New"}
- Potential deal value: $${lead.value || 0}
- Source: ${lead.source || "Unknown"}
- Notes: ${lead.notes || "None"}

Return a JSON object with the following exact keys:
- "summary": a string containing a 2-3 sentence executive summary of the lead
- "riskScore": an integer representing the risk of losing this deal, from 0 (safe) to 100 (high risk)
- "suggestedPriority": a string, exactly one of ["Low", "Medium", "High"]
- "nextBestAction": a string containing one concrete recommended next step`;

  return generateJSON(prompt);
};

export const generateEmail = async ({ lead, purpose, tone, sender }) => {
  const prompt = `You are a senior sales rep writing on behalf of ${
    sender?.name || "our team"
  }${sender?.company ? ` at ${sender.company}` : ""}.

  Write a professional sales email.
Purpose: ${purpose || "follow-up"}
Desired tone: ${tone || "friendly and professional"}

Recipient (lead) details:
- Name: ${lead?.name || "There"}
- Company: ${lead?.company || "N/A"}
- Pipeline stage: ${lead?.status || "New"}
- Context / notes: ${lead?.notes || "None"}

Return a JSON object with the following exact keys:
- "subject": a string with a compelling subject line
- "body": a string containing the complete email body using line breaks (\\n). Keep it under 180 words. Sign off as ${
    sender?.name || "The APEX AI CRM team"
  }.`;

  return generateJSON(prompt);
};

export const generateSalesInsights = async (pipelineStats) => {
  const prompt = `You are a revenue-operations advisor. Given this snapshot of a sales pipeline, identify what is working, what is at risk, and concrete actions to improve conversion.

  Pipeline snapshot (JSON):
  ${JSON.stringify(pipelineStats, null, 2)}
  
  Return a JSON object with the following exact keys:
  - "headline": a string with a one-sentence summary of pipeline health
  - "insights": an array of 3-5 specific, data-driven observation strings
  - "recommendations": an array of 3-5 prioritized, actionable recommendation strings
  - "healthScore": an integer representing overall pipeline health from 0 to 100`;

  return generateJSON(prompt);
};

export { generateText };

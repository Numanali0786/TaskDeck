import { Lead } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateLeadSummary,
  generateEmail,
  generateSalesInsights,
  isAIConfigured,
} from "../services/ai.service.js";

const resolveLead = async (req) => {
  if (req.body.leadId) {
    const lead = await Lead.findOne({
      _id: req.body.leadId,
      owner: req.user._id,
    });
    if (!lead) throw new ApiError(404, "Lead not found");
    return lead;
  }
  if (req.body.lead) return req.body.lead;
  throw new ApiError(400, "Provide a leadId or an inline lead object");
};

export const aiStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    configured: isAIConfigured(),
    model: process.env.GROQ_MODEL || "gemini-2.5-flash",
    // model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
});
export const leadSummary = asyncHandler(async (req, res) => {
  const lead = await resolveLead(req);
  const result = await generateLeadSummary(lead);

  if (req.body.leadId) {
    await Lead.updateOne(
      { _id: req.body.leadId, owner: req.user._id },
      { $set: { aiSummary: result.summary, aiRiskScore: result.riskScore } },
    );
  }

  res.json({ success: true, ...result });
});

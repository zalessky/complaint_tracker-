import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTicket = async (text: string): Promise<GeminiAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following customer complaint/message from a Telegram bot. 
      Classify it, determine priority based on urgency, detect sentiment, summarize it briefly, and write a polite, professional initial response draft.
      
      Message: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A 5-10 word summary of the issue." },
            category: { type: Type.STRING, description: "Category like Maintenance, Billing, Access, General Info, etc." },
            priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"], description: "Urgency level." },
            sentiment: { type: Type.STRING, enum: ["negative", "neutral", "positive"] },
            suggestedResponse: { type: Type.STRING, description: "A draft response to the user." }
          },
          required: ["summary", "category", "priority", "sentiment", "suggestedResponse"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysisResult;
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback for demo purposes if API key is missing or fails
    return {
      summary: "Analysis Failed",
      category: "Uncategorized",
      priority: "medium",
      sentiment: "neutral",
      suggestedResponse: "Thank you for your message. An operator will review it shortly."
    };
  }
};

export const generateCustomResponse = async (history: string, context: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a helpful customer support agent. 
        Context of the issue: ${context}
        Chat History: ${history}
        
        Write a reply to the user.`
     });
     return response.text || "Could not generate response.";
  } catch (e) {
      return "Error generating custom response.";
  }
}
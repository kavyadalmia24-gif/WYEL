
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedLessonData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Clean potentially backticked JSON string from model response.
 */
const cleanJsonResponse = (text: string) => {
  if (!text) return "{}";
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
  
  // Find the actual JSON object bounds
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
};

export const analyzeTradeMove = async (
  action: 'BUY' | 'SELL',
  stock: any,
  quantity: number,
  portfolioValue: number,
  walletBalance: number
): Promise<string> => {
  try {
    const prompt = `Analyze this trade move: ${action} ${quantity} ${stock.symbol} at $${stock.price}. Give a 2-sentence professional verdict.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Move recorded.";
  } catch (error) {
    return "Analyst unavailable.";
  }
};

export const generateStartupIdeas = async (interests: string): Promise<any[]> => {
  const prompt = `Generate 3 startup ideas for: ${interests}. Return as a JSON array of objects with name, tagline, problem, solution.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text || "[]"));
};

export const getStartupCoPilotAdvice = async (stage: string, startupData: any, userQuery: string): Promise<string> => {
  try {
    const systemIns = `Startup Mentor. Stage: ${stage}. Focus on validation. Use Markdown.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: { systemInstruction: systemIns, temperature: 0.7 },
    });
    return response.text || "...";
  } catch (error) {
    return "Mentor is offline.";
  }
};

export const generatePitchDeckSlides = async (startupData: any): Promise<any> => {
  const prompt = `Generate a 10-slide pitch deck structure for: ${JSON.stringify(startupData)}. Return JSON array.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text || "[]"));
};

export const getFinancialAdvice = async (userMessage: string, skill: string = 'FINANCE'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userMessage,
  });
  return response.text || "...";
};

export const getDailyInsight = async (skill: string = 'FINANCE'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `1-sentence ${skill} tip.`,
  });
  return response.text?.trim() || "Stay focused.";
};

export const generateLessonContent = async (topic: string, moduleContext: string): Promise<GeneratedLessonData | null> => {
  const prompt = `Task: Create a concise, high-impact educational lesson.
  Track: "${topic}"
  Module: "${moduleContext}"
  
  Requirements:
  1. Content must be approximately 300-500 words.
  2. Use Markdown headers (##).
  3. Include 3 multiple-choice questions.
  4. Response MUST be valid JSON.
  
  JSON Schema:
  {
    "title": "Module Title",
    "content": "Lesson markdown",
    "simulator": "SIP" | "LUMPSUM" | "EMI" | "null",
    "quiz": [
      {
        "id": 1,
        "question": "text?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Why correct"
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            simulator: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "content", "quiz", "simulator"]
        }
      },
    });

    const rawText = response.text;
    if (!rawText) return null;
    
    return JSON.parse(cleanJsonResponse(rawText));
  } catch (e) {
    console.error("Lesson API Error:", e);
    return null;
  }
};

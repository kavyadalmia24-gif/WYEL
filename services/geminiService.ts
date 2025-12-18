
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedLessonData } from "../types";

// Initialize the Gemini API client using the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets conversational advice from FinBot or EntreBot based on the active skill mode.
 */
export const getFinancialAdvice = async (userMessage: string, skill: string = 'FINANCE'): Promise<string> => {
  try {
    const systemIns = skill === 'FINANCE' 
      ? `You are FinBot, a world-class personal finance expert and conservative financial literacy coach. 
         Educate users on money habits, saving, and investing. Focus on long-term wealth creation. 
         Guidelines: Explain complex terms simply. Do not give specific investment advice or buy/sell signals. 
         Be encouraging and professional. Use markdown for formatting.`
      : `You are EntreBot, a elite startup strategist and silicon valley founder coach. 
         Help users validate ideas, design business models, find product-market fit, and navigate fundraising. 
         Guidelines: Use lean startup principles. Be direct, insightful, and strategic. 
         Encourage customer validation before building. Use markdown for formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemIns,
        temperature: 0.7,
      },
    });

    return response.text || "I'm processing your request, but I couldn't generate a specific response right now.";
  } catch (error) {
    console.error("Gemini API Error (Advice):", error);
    return "I'm currently unable to connect to my knowledge base. Please try again in a moment.";
  }
};

/**
 * Generates a short, punchy daily insight for the dashboard.
 */
export const getDailyInsight = async (skill: string = 'FINANCE'): Promise<string> => {
  try {
    const prompt = skill === 'FINANCE' 
      ? "Give a 1-sentence powerful financial wisdom tip for a retail investor. Be specific and punchy."
      : "Give a 1-sentence powerful startup strategy tip for a first-time founder. Focus on lean or validation.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9,
        maxOutputTokens: 60,
      },
    });

    return response.text?.trim() || "Wealth is built one decision at a time.";
  } catch (error) {
    console.error("Gemini API Error (Daily Insight):", error);
    return "Focus on the process, and the results will follow.";
  }
};

/**
 * Evaluates a startup pitch using the Entrepreneurship persona.
 */
export const evaluatePitch = async (pitch: string, startupData: any) => {
  const prompt = `Act as an expert Venture Capitalist. Evaluate this startup pitch: "${pitch}". 
  Startup context: ${JSON.stringify(startupData)}. 
  Provide a JSON response with a numerical score (1-100), detailed feedback on Clarity, Market Potential, and Traction, and a decimal 'interest' score (0 to 1).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            interest: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "interest"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini API Error (Pitch):", e);
    return { score: 50, feedback: "My analysis engine is currently scaling. Please try submitting your pitch again.", interest: 0.3 };
  }
};

/**
 * Generates an interactive lesson module including content and a quiz.
 */
export const generateLessonContent = async (topic: string, moduleContext: string): Promise<GeneratedLessonData | null> => {
  try {
    const prompt = `Create an elite, highly educational lesson about "${topic}" as part of the "${moduleContext}" curriculum. 
    Requirements:
    1. Title: A catchy, professional title.
    2. Content: Detailed markdown explaining the concept with examples and clear takeaways. Use ## for sections.
    3. Quiz: Exactly 3 high-quality multiple choice questions.
    4. Simulator: Choose the most relevant financial tool if applicable (SIP, LUMPSUM, EMI) or "null" if not fitting.
    
    Return strict JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            simulator: { type: Type.STRING, enum: ["SIP", "LUMPSUM", "EMI", "null"] },
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

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error (Lesson):", error);
    return null;
  }
};

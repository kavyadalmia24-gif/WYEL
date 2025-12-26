
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedLessonData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTradeMove = async (
  action: 'BUY' | 'SELL',
  stock: any,
  quantity: number,
  portfolioValue: number,
  walletBalance: number
): Promise<string> => {
  try {
    const prompt = `Analyze this trade move for a financial education app:
    Action: ${action}
    Stock: ${stock.symbol} (${stock.name})
    Price: $${stock.price}
    Quantity: ${quantity}
    Recent Trend: ${stock.change}% change
    Current Sentiment Score: ${stock.sentiment} (-1 to 1)
    User's Remaining Balance: $${walletBalance}
    User's Total Portfolio: $${portfolioValue}

    Evaluate if this was a smart move or a mistake. Consider:
    1. Timing (Buying on a high/low?)
    2. Diversification (Is the user over-investing in one sector?)
    3. Sentiment (Is this a panic move or following trends?)
    
    Be concise, professional, and slightly critical like a real Wall Street analyst. 
    Use a few emojis. Format with Markdown. Limit to 3-4 sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: "You are the Denari AI Trading Analyst. Your job is to critique user trades instantly to help them learn professional trading habits. Don't be afraid to tell them they made a mistake.",
        temperature: 0.8 
      },
    });
    return response.text || "Move recorded. Analysis pending...";
  } catch (error) {
    return "Analyst is currently busy looking at the tape. Good luck with the trade!";
  }
};

export const generateStartupIdeas = async (interests: string): Promise<any[]> => {
  const prompt = `User interests: ${interests}. 
  Generate 3 highly creative, modern startup ideas. 
  For each, provide:
  1. A catchy business name
  2. A 1-sentence tagline
  3. The core problem it solves
  4. The unique solution.
  Return as a JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            tagline: { type: Type.STRING },
            problem: { type: Type.STRING },
            solution: { type: Type.STRING }
          },
          required: ["name", "tagline", "problem", "solution"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getStartupCoPilotAdvice = async (stage: string, startupData: any, userQuery: string): Promise<string> => {
  try {
    const systemIns = `You are a Silicon Valley Startup Co-Pilot for a student program. 
    Current Journey Stage: ${stage}. 
    Startup Progress so far: ${JSON.stringify(startupData)}. 
    Your goal is to guide the student founder through the PRE-STARTUP phase. 
    Be critical but encouraging. Focus on lean startup principles. 
    If they are in Ideation, suggest ways to validate without code. 
    If they are in Pitching, help with storytelling. 
    Use Markdown for formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: { systemInstruction: systemIns, temperature: 0.8 },
    });
    return response.text || "I'm analyzing your progress...";
  } catch (error) {
    return "The mentor is briefly away. Please try again.";
  }
};

export const generatePitchDeckSlides = async (startupData: any): Promise<any> => {
  const prompt = `Based on this startup data: ${JSON.stringify(startupData)}, generate a 10-slide pitch deck structure. 
  Each slide should have a title, specific content, and 3 key talking points. 
  Slides: 1. The Hook, 2. The Problem, 3. The Solution, 4. Market Size, 5. Product/Tech, 6. Business Model, 7. Competitive Advantage, 8. GTM Strategy, 9. The Team/Vision, 10. The Ask.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "content", "keyPoints"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getFinancialAdvice = async (userMessage: string, skill: string = 'FINANCE'): Promise<string> => {
  try {
    const systemIns = skill === 'FINANCE' 
      ? `You are FinBot, a world-class financial coach. Use simple language, focus on long-term wealth. Markdown only.`
      : `You are EntreBot, a Silicon Valley founder coach. Focus on lean startup methodology, validation, and clarity. Markdown only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: { systemInstruction: systemIns, temperature: 0.7 },
    });
    return response.text || "I'm processing your request...";
  } catch (error) {
    return "Connection issues. Please try again.";
  }
};

export const getDailyInsight = async (skill: string = 'FINANCE'): Promise<string> => {
  const prompt = skill === 'FINANCE' 
    ? "Provide a 1-sentence financial tip."
    : "Provide a 1-sentence entrepreneurship tip.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text?.trim() || "Stay focused.";
};

export const generateLessonContent = async (topic: string, moduleContext: string): Promise<GeneratedLessonData | null> => {
  const prompt = `Create an elite lesson about "${topic}" in "${moduleContext}". Use ## for headers. Include a 3-question quiz.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
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
  return JSON.parse(response.text || "{}");
};

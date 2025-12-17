import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlessingResponse } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLuxuryBlessing = async (userName: string = "Guest"): Promise<BlessingResponse> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      message: {
        type: Type.STRING,
        description: "A short, poetic, high-end luxury Christmas blessing.",
      },
      mood: {
        type: Type.STRING,
        enum: ["elegant", "joyful", "mysterious"],
        description: "The atmospheric mood of the message."
      }
    },
    required: ["message", "mood"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a sophisticated, high-fashion, luxury Christmas blessing for someone named ${userName}. 
      The tone should be like a high-end jewelry brand commercial or a cinematic fantasy. 
      Avoid cliché phrases. Focus on gold, light, eternity, and brilliance. Max 30 words.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as BlessingResponse;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      message: "May your holidays be as timeless as gold and as deep as the emerald night.",
      mood: "elegant"
    };
  }
};
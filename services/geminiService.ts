
import { GoogleGenAI, Type } from "@google/genai";
import { TripCategory } from "../types";

/**
 * World-class senior frontend engineer implementation.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getCitySuggestions = async (query: string, currencyCode: string = 'INR') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for travel details about the city: ${query}. Return JSON format with details. All cost indications should consider ${currencyCode}. Include an imageKeyword field for a high-quality travel photo search.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cityName: { type: Type.STRING },
            country: { type: Type.STRING },
            popularityScore: { type: Type.NUMBER },
            costIndex: { type: Type.STRING, description: 'Low, Medium, High' },
            description: { type: Type.STRING },
            imageKeyword: { type: Type.STRING }
          },
          required: ["cityName", "country", "popularityScore", "costIndex", "imageKeyword"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini City Suggestion Error:", error);
    return null;
  }
};

export const getActivitySuggestions = async (city: string, currencyCode: string = 'INR') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 5 top travel activities for ${city}. Include estimated cost in ${currencyCode} and duration.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              cost: { type: Type.NUMBER },
              duration: { type: Type.STRING },
            },
            required: ["name", "type", "cost", "duration"]
          }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Activity Suggestion Error:", error);
    return [];
  }
};

export const generateFullTrip = async (
  name: string, 
  days: number, 
  budget: number, 
  currencyCode: string = 'INR', 
  adults: number = 1,
  children: number = 0,
  category: TripCategory = 'Solo'
) => {
  try {
    const ai = getAI();
    const totalTravelers = adults + children;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a detailed multi-city travel itinerary for a ${category} trip called "${name}" lasting ${days} days for ${adults} adults and ${children} children (Total: ${totalTravelers} people). Total budget: ${budget} ${currencyCode}. Return JSON format. For each city, provide an 'imageKeyword' for finding a relevant high-quality travel photo. Ensure activities are suitable for a ${category} trip. All costs must be the TOTAL cost for all ${totalTravelers} travelers in ${currencyCode}.`,
      config: {
        thinkingConfig: { thinkingBudget: 1000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            cities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cityName: { type: Type.STRING },
                  country: { type: Type.STRING },
                  imageKeyword: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        cost: { type: Type.NUMBER, description: 'Total cost for all travelers' },
                        duration: { type: Type.STRING },
                        time: { type: Type.STRING, description: 'e.g. 09:00 AM' }
                      },
                      required: ["name", "type", "cost", "duration"]
                    }
                  }
                },
                required: ["cityName", "country", "activities", "imageKeyword"]
              }
            }
          },
          required: ["cities"]
        }
      }
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Full Trip Generation Error:", error);
    return null;
  }
};

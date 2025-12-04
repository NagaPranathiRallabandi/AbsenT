import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client once
const ai = new GoogleGenAI({ apiKey });

/**
 * Extracts alphanumeric roll numbers from a base64 image string (Presentees List).
 */
export const extractRollNumbersFromImage = async (base64Image: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Identify all the student roll numbers or IDs listed in this handwritten or printed document. Return a JSON object with a 'rollNumbers' array of strings. Be careful to read handwritten digits accurately." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rollNumbers: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    return result.rollNumbers || [];
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract numbers from the image.");
  }
};

/**
 * Extracts Class List with Name and Phone from a base64 image string (Master List).
 */
export const extractClassListFromImage = async (base64Image: string): Promise<Student[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Extract the class list from this image. Look for Roll Numbers (ID), Student Names, and Phone Numbers. Return a JSON array of objects where each object has 'id', 'name', and 'phone'. If a field is missing, use an empty string." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Roll Number or ID" },
              name: { type: Type.STRING, description: "Student Name" },
              phone: { type: Type.STRING, description: "Phone Number" }
            },
            required: ["id"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    // Ensure the result is an array of Students
    return Array.isArray(result) ? result : [];

  } catch (error) {
    console.error("Gemini Class Extraction Error:", error);
    throw new Error("Failed to extract class details from the image.");
  }
};
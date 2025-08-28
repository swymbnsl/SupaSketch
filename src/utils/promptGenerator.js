import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Shared prompt generation function
export async function generateDrawingPrompt() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt =
    "Create a simple and fun drawing prompt that players can easily draw in 2 minutes. Make it straightforward but entertaining - things like 'a happy cat wearing a hat', 'a dog riding a bicycle', 'a house with a smiling sun', or 'a pizza with sunglasses'. Keep it simple, clear, and easy to draw. Just write the prompt itself, nothing else.";

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
} 
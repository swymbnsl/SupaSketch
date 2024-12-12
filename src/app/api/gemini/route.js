import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { action, images } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "generate_prompt") {
      const prompt =
        "Create a fun and very simple drawing prompt that players can draw in 2 minutes. Make it easy to understand and a bit funny. Just write the prompt itself, nothing else.";

      const result = await model.generateContent(prompt);
      const promptText = result.response.text();

      return Response.json({ prompt: promptText });
    }

    if (action === "judge_drawings") {
      const { drawing1Data, drawing2Data, prompt } = images;

      // Convert base64 images to Gemini format
      const image1 = {
        inlineData: {
          data: drawing1Data.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/png",
        },
      };

      const image2 = {
        inlineData: {
          data: drawing2Data.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/png",
        },
      };

      const promptText = `You're a friendly art judge looking at drawings from a 2-minute drawing game. 
      The players were asked to draw: "${images.prompt}"
      
      Important judging rules:
      1. Text-only submissions should not be considered valid drawings
      2. Simple stick figures and basic drawings are okay - this is a quick drawing game
      3. The drawing should attempt to illustrate the prompt, not just write it
      4. If both submissions are text-only, pick the one with better presentation
      
      Please:
      1. Pick which drawing better matches the prompt and shows more effort in actually drawing
      2. Give a specific comment about what you see in each drawing
      3. Make a playful joke about the losing drawing, especially if it's just text instead of a drawing
      
      Write your response as JSON like this:
      {
        "winner": "1" or "2",
        "critique1": "your comment about what drawing 1 actually shows",
        "critique2": "your comment about what drawing 2 actually shows",
        "roast": "your friendly joke about the losing drawing",
        "prompt": "what they were asked to draw"
      }`;

      try {
        const result = await visionModel.generateContent([
          promptText,
          image1,
          image2,
        ]);
        const jsonString = result.response.text();
        let judgment;

        try {
          // First try to parse the response directly
          judgment = JSON.parse(jsonString);
        } catch {
          // If direct parsing fails, try to extract JSON from markdown code block
          const jsonMatch =
            jsonString.match(/```json\s*([\s\S]*?)\s*```/) ||
            jsonString.match(/{[\s\S]*}/);
          if (jsonMatch) {
            judgment = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } else {
            throw new Error("Failed to parse Gemini response as JSON");
          }
        }

        // Ensure prompt is included in the response
        judgment.prompt = images.prompt;

        return Response.json(judgment);
      } catch (error) {
        console.error("Error processing Gemini vision response:", error);
        return Response.json(
          { error: "Failed to process images", details: error.message },
          { status: 500 }
        );
      }
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      {
        error: "Failed to process request",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

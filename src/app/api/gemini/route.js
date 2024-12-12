import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { action, images } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "generate_prompt") {
      const prompt =
        "Generate a funny and slightly sarcastic drawing prompt that two players need to draw. Make it challenging but possible to draw in 2 minutes. Format: just the prompt text, nothing else.";

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

      const promptText = `You are a sarcastic art critic judging a 2-minute drawing competition. 
      The original drawing prompt was: "${images.prompt}"
      
      Compare these two drawings and:
      1. Determine the winner based on artistic merit, creativity, and most importantly, how well they followed the prompt
      2. Provide a brief, funny critique of both drawings
      3. For the losing drawing, provide a savage (but lighthearted) roast focusing especially on how well (or poorly) it matches the original prompt. If the drawing is completely off-topic from the prompt, make sure to point that out in your roast.
      
      Format your response as JSON with these fields:
      {
        "winner": "1" or "2",
        "critique1": "critique of drawing 1",
        "critique2": "critique of drawing 2",
        "roast": "sarcastic roast of the losing drawing, emphasizing any mismatch with the prompt",
        "prompt": "the original prompt"
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

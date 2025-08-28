import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import supabase from "@/lib/supabase";
import { generateDrawingPrompt } from "@/utils/promptGenerator";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export async function POST(request) {
  try {
    const { action, images, roomId } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings,
    });

    if (action === "generate_prompt") {
      const promptText = await generateDrawingPrompt();
      return Response.json({ prompt: promptText });
    }

    if (action === "judge_drawings") {
      // Get room data
      const { data: roomData } = await supabase
        .from("rooms")
        .select("judgment, user1_id, user2_id, prompt")
        .eq("room_code", roomId)
        .single();

      // If judgment already exists, return it
      if (roomData?.judgment) {
        return Response.json(roomData.judgment);
      }

      // If no judgment exists, proceed with generation
      const { drawing1Data, drawing2Data, prompt } = images;
      // ... rest of the judgment generation code ...

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

      const promptText = `You're a savage art critic judging 2-minute drawings. The prompt was: "${images.prompt}"
      
      Rules:
      1. Text-only = FAIL
      2. Pick the better drawing
      3. Give detailed, brutal roasts (7-8 lines)
      
      Be mean and detailed! Use simple English but make it long and brutal.
      Give specific critiques about what's wrong with the drawing.
      Make fun of proportions, colors, effort, everything!
      
      Examples of what to roast:
      - "This looks like a 3-year-old drew it with their eyes closed"
      - "Did you use your feet? Even my cat draws better than this"
      - "I've seen better art on bathroom walls"
      - "This is what happens when you give a monkey a crayon"
      - "Your artistic skills are worse than a broken printer"
      
      Write JSON like this:
      {
        "winner": "1" or "2",
        "critique1": "detailed comment about drawing 1 (2-3 lines)",
        "critique2": "detailed comment about drawing 2 (2-3 lines)", 
        "roast": "long, brutal roast of the loser (7-8 lines)",
        "prompt": "what they were asked to draw"
      }`;

      try {
        // Add timeout wrapper for Gemini API call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Gemini API timeout')), 45000); // 45 second timeout
        });

        const result = await Promise.race([
          visionModel.generateContent([
            promptText,
            image1,
            image2,
          ]),
          timeoutPromise
        ]);
        
        const jsonString = result.response.text();
        let judgment;

        try {
          judgment = JSON.parse(jsonString);
        } catch {
          const jsonMatch =
            jsonString.match(/```json\s*([\s\S]*?)\s*```/) ||
            jsonString.match(/{[\s\S]*}/);
          if (jsonMatch) {
            judgment = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } else {
            throw new Error("Failed to parse Gemini response as JSON");
          }
        }

        // Validate judgment structure
        if (!judgment.winner || !judgment.critique1 || !judgment.critique2 || !judgment.roast) {
          throw new Error("Invalid judgment structure from Gemini");
        }
        // Store judgment in the database
        const { error: updateError } = await supabase
          .from("rooms")
          .update({
            judgment: judgment,
            winner_id:
              judgment.winner === "1" ? roomData.user1_id : roomData.user2_id,
          })
          .eq("room_code", roomId);

        if (updateError) throw updateError;

        return Response.json(judgment);
      } catch (error) {
        console.error("Error processing Gemini vision response:", error);
        
        // Return appropriate error based on error type
        if (error.message === 'Gemini API timeout') {
          return Response.json(
            { error: "Request timeout", details: "AI processing took too long. Please try again." },
            { status: 504 }
          );
        } else if (error.message.includes('Invalid judgment structure')) {
          return Response.json(
            { error: "AI response error", details: "AI provided invalid response format. Please try again." },
            { status: 503 }
          );
        } else {
          return Response.json(
            { error: "Failed to process images", details: error.message },
            { status: 500 }
          );
        }
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

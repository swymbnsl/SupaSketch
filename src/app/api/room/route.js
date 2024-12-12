import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function (consider moving to utilities)
const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper function to generate prompt using Gemini
async function generatePrompt() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt =
    "Generate a funny and slightly sarcastic drawing prompt that two players need to draw. Make it challenging but possible to draw in 2 minutes. Format: just the prompt text, nothing else.";

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
}

// Create room
export async function POST(request) {
  try {
    const { sessionToken } = await request.json();
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 401 }
      );
    }

    // Generate prompt first
    const drawingPrompt = await generatePrompt();
    const roomCode = generateRoomCode();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        user1_id: sessionToken,
        user2_id: null,
        drawing1_url: null,
        drawing2_url: null,
        evaluation_status: "pending",
        room_code: roomCode,
        prompt: drawingPrompt, // Store the prompt during room creation
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ room: data[0] }, { status: 201 });
  } catch (err) {
    console.error("Error creating room:", err.message);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// Join room
export async function PUT(request) {
  try {
    const { roomCode, sessionToken } = await request.json();
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 401 }
      );
    }

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    // Check if room exists
    const { data: roomData, error: fetchError } = await supabase
      .from("rooms")
      .select()
      .eq("room_code", roomCode)
      .single();

    if (fetchError || !roomData) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (roomData.user2_id) {
      return NextResponse.json(
        { error: "Room is already full" },
        { status: 400 }
      );
    }

    // Update room
    const { data, error } = await supabase
      .from("rooms")
      .update({ user2_id: sessionToken })
      .eq("room_code", roomCode)
      .select();

    if (error) throw error;

    return NextResponse.json({ room: data[0] }, { status: 200 });
  } catch (err) {
    console.error("Error joining room:", err.message);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

// Check if room exists
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get("roomCode");
    const sessionToken = searchParams.get("sessionToken");

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rooms")
      .select()
      .eq("room_code", roomCode)
      .single();

    if (error || !data) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // Check if the requesting user is the creator
    const isCreator = data.user1_id === sessionToken;

    return NextResponse.json(
      {
        exists: true,
        isCreator: isCreator,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error checking room:", err.message);
    return NextResponse.json(
      { error: "Failed to check room" },
      { status: 500 }
    );
  }
}

// Update user status
export async function PATCH(request) {
  try {
    const {
      room_id,
      status,
      sessionToken,
      gameStarted,
      gameStartTime,
      imageUrl,
    } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 401 }
      );
    }

    if (!room_id || !status) {
      return NextResponse.json(
        { error: "Room ID and status are required" },
        { status: 400 }
      );
    }

    // First, get the room to check user permissions
    const { data: roomData, error: fetchError } = await supabase
      .from("rooms")
      .select()
      .eq("room_code", room_id)
      .single();

    if (fetchError || !roomData) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Determine which user is making the request and what to update
    let updateData = {};
    if (roomData.user1_id === sessionToken) {
      updateData = {
        user1_status: status,
        ...(gameStarted !== undefined && {
          game_started: gameStarted,
          game_start_time: gameStartTime,
        }),
        ...(imageUrl && { drawing1_url: imageUrl }),
      };
    } else if (roomData.user2_id === sessionToken) {
      updateData = {
        user2_status: status,
        ...(imageUrl && { drawing2_url: imageUrl }),
      };
    } else {
      return NextResponse.json(
        { error: "User not authorized for this room" },
        { status: 403 }
      );
    }

    // Update the room with the new status
    const { data, error } = await supabase
      .from("rooms")
      .update(updateData)
      .eq("room_code", room_id)
      .select();

    if (error) throw error;

    return NextResponse.json(
      {
        room: data[0],
        prompt: roomData.prompt, // Include prompt in response
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating user status:", err.message);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}

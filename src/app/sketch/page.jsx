"use client";

import { Suspense } from "react";
import { Tldraw, exportToBlob } from "tldraw";
import "tldraw/tldraw.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionToken } from "@/utils/sessionTokenFunctions";
import axios from "axios";
import supabase from "@/lib/supabase";
import { customToast } from "@/utils/toast";

function SketchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isValidRoom, setIsValidRoom] = useState(false);
  const roomId = searchParams.get("roomCode");
  const [otherUserStatus, setOtherUserStatus] = useState(null);
  const sessionToken = getSessionToken();
  const [gameStarted, setGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [editor, setEditor] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [otherPlayerSubmitted, setOtherPlayerSubmitted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    // Function to validate room
    const validateRoom = async () => {
      if (!roomId) {
        setIsValidRoom(false);
        return;
      }
      try {
        const response = await axios.get(`/api/room`, {
          params: { roomCode: roomId },
        });

        if (response.data.exists) {
          setIsValidRoom(true);
          return;
        }
      } catch (error) {
        console.error("Error validating room:", error);
        setIsValidRoom(false);
        return;
      }
    };

    validateRoom();

    const updateUserStatus = async () => {
      try {
        const response = await axios.patch("/api/room", {
          room_id: roomId,
          status: "joined",
          sessionToken: getSessionToken(),
        });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    };

    updateUserStatus();
  }, [roomId]);

  useEffect(() => {
    // Function to check if user is creator
    const checkCreator = async () => {
      try {
        const response = await axios.get(`/api/room`, {
          params: {
            roomCode: roomId,
            sessionToken: sessionToken,
          },
        });
        setIsCreator(response.data.isCreator);
      } catch (error) {
        console.error("Error checking creator status:", error);
      }
    };

    if (roomId && sessionToken) {
      checkCreator();
    }
  }, [roomId, sessionToken]);

  useEffect(() => {
    if (!roomId || !isValidRoom || !sessionToken) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: sessionToken,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const allPresences = Object.values(presenceState).flat();
        const otherUsers = allPresences.filter((p) => p.key !== sessionToken);
        const otherUserPresent = otherUsers.length > 0;

        // Check if other user is ready
        const otherUserReady = otherUsers.some((user) => user.ready === true);
        setOtherUserStatus(
          otherUserPresent
            ? otherUserReady
              ? "ready"
              : "connected"
            : "disconnected"
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            key: sessionToken,
            ready: isReady,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isValidRoom, sessionToken, isReady]);

  useEffect(() => {
    if (!roomId || !isValidRoom || !sessionToken) return;

    // Get initial room data including prompt
    const fetchRoomData = async () => {
      try {
        const { data: roomData, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("room_code", roomId)
          .single();

        if (error) throw error;
        if (roomData.prompt) {
          setPrompt(roomData.prompt);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();

    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room-updates-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_code=eq.${roomId}`,
        },
        (payload) => {
          // Update prompt when it changes
          if (payload.new.prompt) {
            setPrompt(payload.new.prompt);
          }
          // Handle game start
          if (payload.new.game_started && payload.new.game_start_time) {
            setGameStartTime(new Date(payload.new.game_start_time));
            setGameStarted(true);
          }

          // Handle submissions
          const isUser1 = payload.new.user1_id === sessionToken;
          const drawing1Submitted = payload.new.drawing1_url !== null;
          const drawing2Submitted = payload.new.drawing2_url !== null;

          // Update submission states
          if (isUser1) {
            setOtherPlayerSubmitted(drawing2Submitted);
            setHasSubmitted(drawing1Submitted);
          } else {
            setOtherPlayerSubmitted(drawing1Submitted);
            setHasSubmitted(drawing2Submitted);
          }

          // Check if both players have submitted
          if (drawing1Submitted && drawing2Submitted) {
            setGameEnded(true);
            router.push(`/sketch/results?roomCode=${roomId}`);
          }
        }
      )
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [roomId, isValidRoom, sessionToken]);

  // Synced timer effect with auto-submission
  useEffect(() => {
    if (!gameStartTime || gameEnded) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now - gameStartTime) / 1000);
      const remainingSeconds = Math.max(120 - elapsedSeconds, 0);

      if (remainingSeconds === 0) {
        clearInterval(timer);
        setGameEnded(true);
        // Auto-submit if haven't submitted yet and editor is available
        if (!hasSubmitted && editor) {
          handleAutoSubmit();
        }
      }

      setTimeLeft(remainingSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStartTime, gameEnded, hasSubmitted, editor]);

  // Modified auto-submit function
  const handleAutoSubmit = async () => {
    if (!editor) return;

    try {
      const shapeIds = editor.getCurrentPageShapeIds();

      // Export canvas to blob (even if empty)
      const blob = await exportToBlob({
        editor,
        ids: [...shapeIds],
        format: "png",
        opts: { background: true },
      });

      // Create file name with room ID and timestamp
      const fileName = `${roomId}_${Date.now()}_timeout.png`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("drawings")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("drawings").getPublicUrl(fileName);

      // Update database with image URL and status
      await axios.patch("/api/room", {
        room_id: roomId,
        sessionToken: sessionToken,
        status: "auto_submitted",
        imageUrl: publicUrl,
      });

      setHasSubmitted(true);
    } catch (error) {
      console.error("Error auto-submitting drawing:", error);
    }
  };

  const handleReady = async () => {
    try {
      await axios.patch("/api/room", {
        room_id: roomId,
        status: "ready",
        sessionToken: sessionToken,
      });
      setIsReady(true);
    } catch (error) {
      console.error("Error updating ready status:", error);
    }
  };

  const handleStart = async () => {
    try {
      const gameStartTime = new Date().toISOString();

      await axios.patch("/api/room", {
        room_id: roomId,
        status: "ready",
        sessionToken: sessionToken,
        gameStarted: true,
        gameStartTime: gameStartTime,
      });

      setGameStarted(true);
      setGameStartTime(new Date(gameStartTime));
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleSubmitDrawing = async () => {
    if (!editor) {
      customToast.error("Editor is not ready");
      return;
    }

    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        customToast.error("Please draw something before submitting!");
        return;
      }

      // Export canvas to blob
      const blob = await exportToBlob({
        editor,
        ids: [...shapeIds],
        format: "png",
        opts: { background: true },
      });

      // Create file name with room ID and timestamp
      const fileName = `${roomId}_${Date.now()}.png`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("drawings")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("drawings").getPublicUrl(fileName);

      // Update database with image URL
      await axios.patch("/api/room", {
        room_id: roomId,
        sessionToken: sessionToken,
        status: "submitted",
        imageUrl: publicUrl,
      });

      setHasSubmitted(true);
      customToast.success("Drawing submitted successfully!");
    } catch (error) {
      console.error("Error submitting drawing:", error);
      customToast.error("Failed to submit drawing. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Update status display in the UI
  const StatusIndicator = () => (
    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm inline-flex items-center gap-1.5 self-start">
      <span className="w-2 h-2 bg-white rounded-full"></span>
      Player 2: {otherUserStatus || "Waiting..."}
    </div>
  );

  if (!isValidRoom) {
    return <div>Invalid room ID</div>;
  }

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Waiting Room
          </h2>
          <StatusIndicator />

          {isCreator ? (
            <button
              className="w-full mt-6 px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold transition-all hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={otherUserStatus !== "ready"}
              onClick={handleStart}
            >
              Start Game
            </button>
          ) : (
            <button
              className={`w-full mt-6 px-6 py-4 ${
                isReady ? "bg-green-500" : "bg-blue-500"
              } text-white rounded-xl font-semibold transition-all hover:opacity-90`}
              onClick={handleReady}
              disabled={isReady}
            >
              {isReady ? "Ready!" : "Ready Up"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-7 text-slate-900 flex items-center gap-3">
        <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          Prompt
        </span>
        Draw: &quot;{prompt || "Loading prompt..."}&quot;
      </h1>

      <div className="flex gap-7 h-[calc(100vh-120px)]">
        {/* Main Canvas Area */}
        <div className="flex-[0_0_65%] relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <Tldraw
            acceptedImageMimeTypes={[]}
            acceptedVideoMimeTypes={[]}
            options={{ maxPages: 1 }}
            components={{
              ContextMenu: null,
              HelpMenu: null,
              MainMenu: null,
              KeyboardShortcutsDialog: null,
              SharePanel: null,
              CursorChatBubble: null,
            }}
            onMount={(editorInstance) => setEditor(editorInstance)}
          />
        </div>

        {/* Right Side Panel */}
        <div className="flex-[0_0_35%] flex flex-col gap-6 h-full overflow-y-auto">
          {/* Status Card */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-lg font-semibold mb-5 text-slate-900 flex items-center gap-2">
              <span className="text-blue-500">●</span> Game Status
            </div>
            <div className="flex flex-col gap-4">
              {gameEnded ? (
                <div className="text-2xl font-semibold text-red-500">
                  Game Ended!
                </div>
              ) : (
                <div className="text-2xl font-semibold text-slate-700">
                  {formatTime(timeLeft)}
                </div>
              )}
              <StatusIndicator />
              <div className="flex flex-col gap-2">
                {hasSubmitted && (
                  <div className="text-green-500 font-medium">
                    ✓ You have submitted your drawing
                  </div>
                )}
                {otherPlayerSubmitted && (
                  <div className="text-blue-500 font-medium">
                    ✓ Other player has submitted their drawing
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold transition-all hover:bg-blue-600 hover:-translate-y-0.5 shadow-sm shadow-blue-500/30"
              onClick={handleSubmitDrawing}
              disabled={hasSubmitted || gameEnded}
            >
              {hasSubmitted ? "Drawing Submitted" : "Submit Drawing"}
            </button>
            <button
              className="px-6 py-4 bg-white text-red-500 border border-red-200 rounded-xl font-semibold transition-all hover:bg-red-500 hover:text-white hover:-translate-y-0.5"
              disabled={gameEnded}
            >
              Abort Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sketch() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl font-semibold">Loading sketch pad...</div>
        </div>
      }
    >
      <SketchContent />
    </Suspense>
  );
}

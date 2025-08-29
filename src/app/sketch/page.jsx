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
import { useGameState } from "@/context/GameStateContext";
import { playSound } from "@/utils/sound";

function SketchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isValidRoom, setIsValidRoom] = useState(null); // null = loading, true = valid, false = invalid
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
  const { setGameStarted: setGameStartedContext } = useGameState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadying, setIsReadying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

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
        } else {
          setIsValidRoom(false);
        }
      } catch (error) {
        console.error("Error validating room:", error);
        setIsValidRoom(false);
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
            setGameStartedContext(true);
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
            setGameStartedContext(false);
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
        setGameStartedContext(false);
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
    setIsReadying(true);
    playSound.click();
    try {
      await axios.patch("/api/room", {
        room_id: roomId,
        status: "ready",
        sessionToken: sessionToken,
      });
      setIsReady(true);
    } catch (error) {
      console.error("Error updating ready status:", error);
    } finally {
      setIsReadying(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    playSound.click();
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
      setGameStartedContext(true);
      setGameStartTime(new Date(gameStartTime));
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitDrawing = async () => {
    if (!editor) {
      customToast.error("Editor is not ready");
      return;
    }

    setIsSubmitting(true);
    playSound.click();
    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        customToast.error("Please draw something before submitting!");
        return;
      }

      const blob = await exportToBlob({
        editor,
        ids: [...shapeIds],
        format: "png",
        opts: { background: true },
      });

      const fileName = `${roomId}_${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from("drawings")
        .upload(fileName, blob, {
          contentType: "image/png",
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("drawings").getPublicUrl(fileName);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Update status display in the UI
  const StatusIndicator = () => (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
      <span className="flex items-center gap-1.5 sm:gap-2">
        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"></span>
        <span className="text-xs sm:text-sm font-medium text-white">
          Player 2: {otherUserStatus || "Waiting..."}
        </span>
      </span>
    </div>
  );

  if (isValidRoom === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent text-center">
          Loading Room
        </h1>
        <p className="text-gray-400 text-center text-sm sm:text-base">
          Please wait while we validate your room...
        </p>
      </div>
    );
  }

  if (isValidRoom === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent text-center">
          Invalid Room
        </h1>
        <p className="text-gray-400 text-center text-sm sm:text-base">
          Please check your room code and try again
        </p>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="p-4 sm:p-6 md:p-8 bg-[#1a1a1a] rounded-xl border border-gray-800 max-w-md w-full mx-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent text-center">
            Waiting Room
          </h2>

          {isCreator ? (
            <>
              <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg border border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Your Room Code:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-purple-400 tracking-wide">
                      {roomId}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomId);
                        customToast.success("Room code copied!");
                      }}
                      className="p-1.5 sm:p-2 hover:bg-violet-100 rounded-md transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-violet-600 sm:w-4 sm:h-4"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-[#2a2a2a] p-3 sm:p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-purple-400 mb-2 text-sm sm:text-base">
                    Invite Your Friend
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-600">
                    Share this code with a friend to start the drawing battle!
                    They&apos;ll need to:
                  </p>
                  <ol className="mt-2 text-xs sm:text-sm text-blue-600 list-decimal list-inside space-y-1">
                    <li>Visit SupaSketch</li>
                    <li>Click &quot;Join Room&quot;</li>
                    <li>
                      Enter code: <span className="font-bold">{roomId}</span>
                    </li>
                  </ol>
                </div>
              </div>

              <StatusIndicator />
              <button
                className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={otherUserStatus !== "ready" || isStarting}
                onClick={handleStart}
              >
                {isStarting
                  ? "Starting Game..."
                  : otherUserStatus === "ready"
                  ? "Start Game"
                  : "Waiting for player to join..."}
              </button>
            </>
          ) : (
            <>
              <StatusIndicator />
              <button
                className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 text-sm sm:text-base"
                onClick={handleReady}
                disabled={isReady || isReadying}
              >
                {isReadying
                  ? "Getting Ready..."
                  : isReady
                  ? "Ready!"
                  : "Ready Up"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#0a0a0a]">
      <h1 className="text-base sm:text-lg md:text-2xl font-bold mb-3 sm:mb-4 md:mb-7 text-white flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium w-fit">
          Prompt
        </span>
        <span className="text-xs sm:text-sm md:text-base">Draw: &quot;{prompt || "Loading prompt..."}&quot;</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-7 h-[calc(100vh-120px)] sm:h-[calc(100vh-130px)] md:h-[calc(100vh-120px)]">
        <div className="w-full lg:flex-[0_0_65%] h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-full relative border border-gray-800 rounded-xl overflow-hidden bg-[#1a1a1a]">
          <Tldraw
            inferDarkMode
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

        <div className="w-full lg:flex-[0_0_35%] flex flex-col gap-3 sm:gap-4 md:gap-6 h-auto lg:h-full lg:overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
            <div className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-5 text-white flex items-center gap-2">
              <span className="text-blue-500">●</span> Game Status
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
              {gameEnded ? (
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-red-500">
                  Game Ended!
                </div>
              ) : (
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                  {formatTime(timeLeft)}
                </div>
              )}
              <StatusIndicator />
              <div className="flex flex-col gap-1 sm:gap-2">
                {hasSubmitted && (
                  <div className="text-green-500 font-medium text-xs sm:text-sm md:text-base">
                    ✓ You have submitted your drawing
                  </div>
                )}
                {otherPlayerSubmitted && (
                  <div className="text-blue-500 font-medium text-xs sm:text-sm md:text-base">
                    ✓ Other player has submitted their drawing
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 text-xs sm:text-sm md:text-base"
              onClick={handleSubmitDrawing}
              disabled={hasSubmitted || gameEnded || isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : hasSubmitted
                ? "Drawing Submitted"
                : "Submit Drawing"}
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

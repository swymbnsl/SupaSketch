"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import supabase from "@/lib/supabase";
import { customToast } from "@/utils/toast";
import { getSessionToken } from "@/utils/sessionTokenFunctions";
import { playSound } from "@/utils/sound";
import Link from "next/link";

function ResultsContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomCode");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing1Url, setDrawing1Url] = useState(null);
  const [drawing2Url, setDrawing2Url] = useState(null);
  const [error, setError] = useState(null);

  const sessionToken = getSessionToken();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-judgment-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_code=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new.judgment) {
            setResults(payload.new.judgment);
            playSound.success();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get room data with drawings
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("room_code", roomId)
          .single();

        if (roomError) throw roomError;

        if (!roomData.drawing1_url || !roomData.drawing2_url) {
          setLoading(false);
          return;
        }

        // Store drawing URLs
        setDrawing1Url(roomData.drawing1_url);
        setDrawing2Url(roomData.drawing2_url);

        try {
          // Convert URLs to base64
          const [drawing1Res, drawing2Res] = await Promise.all([
            fetch(roomData.drawing1_url),
            fetch(roomData.drawing2_url),
          ]);

          const [drawing1Blob, drawing2Blob] = await Promise.all([
            drawing1Res.blob(),
            drawing2Res.blob(),
          ]);

          const [drawing1Data, drawing2Data] = await Promise.all([
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(drawing1Blob);
            }),
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(drawing2Blob);
            }),
          ]);

          // Get judgment from Gemini if not already judged
          if (!roomData.judgment) {
            // Only the room creator should generate the judgment
            if (roomData.user1_id === sessionToken) {
              // Start the judgment process (fire and forget)
              axios.post("/api/gemini", {
                action: "judge_drawings",
                images: {
                  drawing1Data,
                  drawing2Data,
                  prompt: roomData.prompt,
                },
                roomId: roomId,
              }).then(() => {
                console.log("Started judgment process successfully");
                customToast.success("AI is analyzing your masterpieces...");
              }).catch(error => {
                console.log("Request sent, process continues in background");
                customToast.success("AI is analyzing your masterpieces...");
              });
            } else {
              // Non-creator shows waiting message
              customToast.success("Waiting for AI to analyze the drawings...");
            }
            
            // Both creator and non-creator wait for results via real-time updates
            const maxAttempts = 60; // 3 minutes total
            let attempts = 0;

            const waitForJudgment = async () => {
              try {
                const { data: updatedRoom } = await supabase
                  .from("rooms")
                  .select("judgment, evaluation_status")
                  .eq("room_code", roomId)
                  .single();

                if (updatedRoom.judgment) {
                  setResults(updatedRoom.judgment);
                  playSound.success();
                } else if (updatedRoom.evaluation_status === "pending" && attempts < maxAttempts) {
                  attempts++;
                  setTimeout(waitForJudgment, 3000);
                } else if (attempts >= maxAttempts) {
                  customToast.error(
                    "AI is taking too long. Please refresh the page."
                  );
                }
              } catch (error) {
                console.error("Error checking for judgment:", error);
                if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(waitForJudgment, 3000);
                }
              }
            };

            waitForJudgment();
          } else {
            // Use existing judgment from database
            setResults(roomData.judgment);
          }
        } catch (error) {
          customToast.error("Failed to process images. Please try refreshing.");
          console.error("Image processing error:", error);
        }

        setLoading(false);
      } catch (error) {
        customToast.error("Failed to load results. Please try refreshing.");
        console.error("Error fetching results:", error);
        setLoading(false);
        setError(error.message);
      }
    };

    if (roomId) {
      fetchResults();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-violet-500 mb-4 sm:mb-6"></div>
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-violet-400 mb-3 sm:mb-4 text-center">
          Judging masterpieces...
        </div>
        <div className="text-xs sm:text-sm md:text-base text-gray-400 text-center max-w-md px-4">
          Our AI critic is analyzing the artistic genius (or lack thereof). This may take up to a minute.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-4">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4">😵</div>
          <div className="text-lg sm:text-xl md:text-2xl text-red-400 mb-4">
            Oops! Something went wrong.
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-6">
            The AI judge might be having a bad day, or the processing took too long. 
          </p>
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-pink-500 transition-all duration-200 text-sm sm:text-base"
            >
              Try Again
            </button>
            <Link
              href="/join"
              className="block w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
            >
              Start New Game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-lg sm:text-xl md:text-2xl text-amber-400 text-center">
          Waiting for all drawings to be submitted...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 text-center bg-gradient-to-r from-violet-500 via-pink-500 to-red-500 text-transparent bg-clip-text">
        The Results Are In!
      </h1>

      <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-center mb-4 sm:mb-6 md:mb-8 text-gray-300 px-4">
        Prompt: &quot;{results?.prompt || "Loading prompt..."}&quot;
      </div>

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 md:gap-8">
        {/* Left side - Drawings */}
        <div className="w-full xl:w-2/3 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Drawing 1 */}
          <div className="flex-1 bg-gray-900 p-3 sm:p-4 md:p-6 rounded-xl border border-violet-500/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-violet-400">
              Drawing 1
            </h2>
            {drawing1Url && (
              <img
                src={drawing1Url}
                alt="Drawing 1"
                className="w-full rounded-lg mb-2 sm:mb-3 md:mb-4 border border-violet-500/30"
              />
            )}
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">{results.critique1}</p>
          </div>

          {/* Drawing 2 */}
          <div className="flex-1 bg-gray-900 p-3 sm:p-4 md:p-6 rounded-xl border border-violet-500/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-violet-400">
              Drawing 2
            </h2>
            {drawing2Url && (
              <img
                src={drawing2Url}
                alt="Drawing 2"
                className="w-full rounded-lg mb-2 sm:mb-3 md:mb-4 border border-violet-500/30"
              />
            )}
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">{results.critique2}</p>
          </div>
        </div>

        {/* Right side - Results and Button */}
        <div className="w-full xl:w-1/3">
          <div className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 p-3 sm:p-4 md:p-6 rounded-xl border border-violet-500/30 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-violet-400 to-pink-400 text-transparent bg-clip-text">
                Winner: Drawing {results.winner}
              </h2>
              <div className="text-violet-300 font-medium italic text-base sm:text-lg md:text-xl">
                &quot;{results.roast}&quot;
              </div>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-auto md:pt-8">
              <Link
                href="/join"
                onClick={() => playSound.button()}
                className="block px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-base sm:text-lg md:text-xl font-semibold rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-violet-500/25 text-center"
              >
                Start New Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

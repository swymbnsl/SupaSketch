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
          // src/app/sketch/results/page.jsx

          // In the fetchResults function
          if (!roomData.judgment) {
            // Only the room creator should generate the judgment
            if (roomData.user1_id === sessionToken) {
              try {
                const response = await axios.post("/api/gemini", {
                  action: "judge_drawings",
                  images: {
                    drawing1Data,
                    drawing2Data,
                    prompt: roomData.prompt,
                  },
                  roomId: roomId,
                });

                setResults(response.data);
              } catch (error) {
                customToast.error(
                  "Failed to get AI judgment. Please try refreshing."
                );
                console.error("Gemini API error:", error);
                setResults(null);
              }
            } else {
              // Non-creator users should wait for the judgment
              const maxAttempts = 10;
              let attempts = 0;

              const waitForJudgment = async () => {
                const { data: updatedRoom } = await supabase
                  .from("rooms")
                  .select("judgment")
                  .eq("room_code", roomId)
                  .single();

                if (updatedRoom.judgment) {
                  setResults(updatedRoom.judgment);
                } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(waitForJudgment, 2000); // Check every 2 seconds
                } else {
                  customToast.error(
                    "Timeout waiting for results. Please refresh."
                  );
                }
              };

              waitForJudgment();
            }
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-3xl font-semibold text-violet-400">
          Judging masterpieces...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-red-400 text-center max-w-md">
          <p>Oops! Something went wrong.</p>
          <p className="text-sm mt-2 text-gray-400">Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-amber-400">
          Waiting for all drawings to be submitted...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-violet-500 via-pink-500 to-red-500 text-transparent bg-clip-text">
        The Results Are In!
      </h1>

      <div className="text-2xl text-center mb-8 text-gray-300">
        Prompt: &quot;{results?.prompt || "Loading prompt..."}&quot;
      </div>

      <div className="flex gap-8">
        {/* Left side - Drawings side by side */}
        <div className="w-2/3 flex gap-8">
          {/* Drawing 1 */}
          <div className="flex-1 bg-gray-900 p-6 rounded-xl border border-violet-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-violet-400">
              Drawing 1
            </h2>
            {drawing1Url && (
              <img
                src={drawing1Url}
                alt="Drawing 1"
                className="w-full rounded-lg mb-4 border border-violet-500/30"
              />
            )}
            <p className="text-gray-300">{results.critique1}</p>
          </div>

          {/* Drawing 2 */}
          <div className="flex-1 bg-gray-900 p-6 rounded-xl border border-violet-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-violet-400">
              Drawing 2
            </h2>
            {drawing2Url && (
              <img
                src={drawing2Url}
                alt="Drawing 2"
                className="w-full rounded-lg mb-4 border border-violet-500/30"
              />
            )}
            <p className="text-gray-300">{results.critique2}</p>
          </div>
        </div>

        {/* Right side - Results and Button */}
        <div className="w-1/3">
          <div className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 p-6 rounded-xl border border-violet-500/30 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-pink-400 text-transparent bg-clip-text">
                Winner: Drawing {results.winner}
              </h2>
              <div className="text-violet-300 font-medium italic text-xl">
                &quot;{results.roast}&quot;
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Link
                href="/join"
                onClick={() => playSound.button()}
                className="block px-8 py-4 text-xl font-semibold rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-violet-500/25 text-center"
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

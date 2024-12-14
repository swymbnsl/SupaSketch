"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import supabase from "@/lib/supabase";
import { customToast } from "@/utils/toast";

function ResultsContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomCode");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing1Url, setDrawing1Url] = useState(null);
  const [drawing2Url, setDrawing2Url] = useState(null);
  const [error, setError] = useState(null);

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
            try {
              const response = await axios.post("/api/gemini", {
                action: "judge_drawings",
                images: {
                  drawing1Data,
                  drawing2Data,
                  prompt: roomData.prompt,
                },
              });

              // Store judgment in database
              const { error: updateError } = await supabase
                .from("rooms")
                .update({
                  judgment: response.data,
                  winner_id:
                    response.data.winner === "1"
                      ? roomData.user1_id
                      : roomData.user2_id,
                })
                .eq("room_code", roomId);
              if (updateError) {
                throw new Error("Failed to update room with judgment");
              }

              setResults(response.data);
            } catch (error) {
              customToast.error(
                "Failed to get AI judgment. Please try refreshing."
              );
              console.error("Gemini API error:", error);
              setResults(null); // Reset results state on error
            }
          } else {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">Judging masterpieces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500 text-center max-w-md">
          <p>Oops! Something went wrong.</p>
          <p className="text-sm mt-2">Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-amber-500">
          Waiting for all drawings to be submitted...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        The Results Are In!
      </h1>

      <div className="text-xl text-center mb-8">
        Prompt: &quot;{results?.prompt || "Loading prompt..."}&quot;
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Drawing 1</h2>
          {drawing1Url && (
            <img
              src={drawing1Url}
              alt="Drawing 1"
              className="w-full rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700">{results.critique1}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Drawing 2</h2>
          {drawing2Url && (
            <img
              src={drawing2Url}
              alt="Drawing 2"
              className="w-full rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700">{results.critique2}</p>
        </div>
      </div>

      <div className="bg-violet-100 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Winner: Drawing {results.winner}
        </h2>
        <div className="text-violet-800 font-medium italic">
          &quot;{results.roast}&quot;
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

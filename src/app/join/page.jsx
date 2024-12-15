"use client";

import {
  generateSessionToken,
  storeSessionToken,
  getSessionToken,
} from "@/utils/sessionTokenFunctions";
import { Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { customToast } from "@/utils/toast";

export default function Join() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState({
    create: false,
    join: false,
  });

  useEffect(() => {
    const sessionToken = generateSessionToken();
    storeSessionToken(sessionToken);
  }, []);

  const handleCreateRoom = async () => {
    setIsLoading({ ...isLoading, create: true });
    try {
      const response = await axios.post("/api/room", {
        sessionToken: getSessionToken(),
      });
      customToast.success("Room created successfully");
      router.push(`/sketch?roomCode=${response.data.room.room_code}`);
    } catch (error) {
      customToast.error(error.response.data.error);
    } finally {
      setIsLoading({ ...isLoading, create: false });
    }
  };

  const handleJoinRoom = async () => {
    setIsLoading({ ...isLoading, join: true });
    try {
      const response = await axios.put("/api/room", {
        roomCode,
        sessionToken: getSessionToken(),
      });
      customToast.success("Room joined successfully");
      router.push(`/sketch?roomCode=${roomCode}`);
    } catch (error) {
      customToast.error(error.response.data.error);
    } finally {
      setIsLoading({ ...isLoading, join: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto py-20 px-6">
        <h1 className="text-6xl font-bold mb-4 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Join the Battle
        </h1>
        <p className="text-zinc-400 text-center text-xl mb-16">
          Create or join a room to start your artistic journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
            <div>
              <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Plus className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Create New Room
              </h2>
              <p className="text-zinc-400 mb-6">
                Start a new drawing room and invite others to join your creative
                session
              </p>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading.create}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading.create ? "Creating..." : "Create Room"}
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Join Existing Room
            </h2>
            <p className="text-zinc-400 mb-6">
              Enter a room code to join an existing drawing session
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 text-white border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 placeholder-zinc-500"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode || isLoading.join}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  roomCode && !isLoading.join
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:opacity-90"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isLoading.join ? "Joining..." : "Join Room"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  generateSessionToken,
  storeSessionToken,
  getSessionToken,
} from "@/utils/sessionTokenFunctions";
import { Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function Join() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const sessionToken = generateSessionToken();
    storeSessionToken(sessionToken);
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("/api/room", {
        sessionToken: getSessionToken(),
      });
      console.log(response);
      toast.success("Room created successfully");
      router.push(`/sketch?roomCode=${response.data.room.room_code}`);
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const response = await axios.put("/api/room", {
        roomCode,
        sessionToken: getSessionToken(),
      });
      toast.success("Room joined successfully");
      router.push("/sketch");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <>
      <div className="max-w-4xl flex flex-col items-center justify-center h-screen mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Join or Create a Room
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <div className="bg-white rounded-xl flex flex-col justify-between p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div>
              <div className="h-16 w-16 bg-violet-600 rounded-lg flex items-center justify-center mb-6">
                <Plus className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Create New Room</h2>
              <p className="text-zinc-600 mb-6">
                Start a new drawing room and invite others to join your creative
                session
              </p>
            </div>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700"
            >
              Create Room
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-violet-600 rounded-lg flex items-center justify-center mb-6">
              <Users className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Join Existing Room</h2>
            <p className="text-zinc-600 mb-6">
              Enter a room code to join an existing drawing session
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 bg-white text-zinc-900 rounded-lg focus:outline-none focus:border-violet-600"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode}
                className={`w-full px-6 py-3 rounded-lg font-semibold ${
                  roomCode
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "bg-violet-400 text-white"
                }`}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

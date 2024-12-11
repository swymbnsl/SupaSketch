"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionToken } from "@/utils/sessionTokenFunctions";
import axios from "axios";
import supabase from "@/lib/supabase";

export default function App() {
  const searchParams = useSearchParams();
  const [isValidRoom, setIsValidRoom] = useState(false);
  const roomId = searchParams.get("roomCode");
  const [otherUserStatus, setOtherUserStatus] = useState(null);
  const sessionToken = getSessionToken();

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
    if (!roomId || !isValidRoom || !sessionToken) return;

    // Set up real-time presence channel
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
        console.log("Presence state:", presenceState);

        // Get all presence entries
        const allPresences = Object.values(presenceState).flat();

        // Filter out current user's presence
        const otherUsers = allPresences.filter((p) => p.key !== sessionToken);

        // Check if there are any other users
        const otherUserPresent = otherUsers.length > 0;

        console.log("Other users:", otherUsers);
        console.log("Other user present:", otherUserPresent);

        setOtherUserStatus(otherUserPresent ? "connected" : "disconnected");
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            key: sessionToken,
          });
        }
      });

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isValidRoom, sessionToken]);

  // Update status display in the UI
  const StatusIndicator = () => (
    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm inline-flex items-center gap-1.5 self-start">
      <span className="w-2 h-2 bg-white rounded-full"></span>
      Player 2: {otherUserStatus || "Waiting..."}
    </div>
  );

  if (!isValidRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500 font-semibold">
          Invalid room ID
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto  min-h-screen">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-7 text-slate-900 flex items-center gap-3">
        <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          Prompt
        </span>
        Draw: "A Cat Playing Piano"
      </h1>

      <div className="flex gap-7 h-[calc(100vh-120px)]">
        {/* Main Canvas Area */}
        <div className="flex-[0_0_65%] relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <Tldraw
            persistenceKey="example"
            options={{ maxPages: 1 }}
            components={{
              ContextMenu: null,
              HelpMenu: null,
              MainMenu: null,
              KeyboardShortcutsDialog: null,
              SharePanel: null,
              CursorChatBubble: null,
            }}
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
              <div className="text-2xl font-semibold text-slate-700">2:00</div>
              <StatusIndicator />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold transition-all hover:bg-blue-600 hover:-translate-y-0.5 shadow-sm shadow-blue-500/30">
              Submit Drawing
            </button>
            <button className="px-6 py-4 bg-white text-red-500 border border-red-200 rounded-xl font-semibold transition-all hover:bg-red-500 hover:text-white hover:-translate-y-0.5">
              Abort Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

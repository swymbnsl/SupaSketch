import Navbar from "@/components/navbar";
import { Bot, Database, Pencil, Trophy } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero section with Supabase-inspired gradient */}
      <div className="min-h-[600px] bg-gradient-to-br from-[#1E1E1E] via-[#3ECF8E] to-[#00C2FF] flex flex-col items-center justify-center px-6 md:px-24 text-white">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Draw, Compete, Let AI Decide
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join the ultimate sketching showdown where your creativity meets
            artificial intelligence, powered by Supabase
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#3ECF8E] px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 flex items-center justify-center gap-2">
              <Pencil /> Start Drawing
            </button>
            <button className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#3ECF8E] flex items-center justify-center gap-2">
              <Trophy /> View Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-16 text-center">
          How SupaSketch Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Feature cards */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-[#3ECF8E] rounded-lg flex items-center justify-center mb-6">
              <Pencil className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Draw Your Best</h3>
            <p className="text-gray-600">
              Get creative with our intuitive drawing tools and complete
              challenges in real-time
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-[#00C2FF] rounded-lg flex items-center justify-center mb-6">
              <Bot className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Evaluation</h3>
            <p className="text-gray-600">
              Advanced AI algorithms analyze and score your drawings instantly
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-[#1E1E1E] rounded-lg flex items-center justify-center mb-6">
              <Database className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Powered by Supabase</h3>
            <p className="text-gray-600">
              Real-time updates, secure authentication, and lightning-fast
              performance
            </p>
          </div>
        </div>
      </div>

      {/* Live Competition Section */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Live Competitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-r from-[#3ECF8E] to-[#00C2FF] relative">
                  <div className="absolute top-4 right-4 bg-white text-[#3ECF8E] px-3 py-1 rounded-full text-sm font-semibold">
                    Live Now
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Challenge #{item}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Draw a magical forest scene in 5 minutes
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      12 participants
                    </span>
                    <button className="bg-[#3ECF8E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90">
                      Join Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

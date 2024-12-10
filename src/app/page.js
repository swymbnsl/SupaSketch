"use client";

import Navbar from "@/components/navbar";
import { Bot, Database, Pencil, Trophy } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero section with Supabase-inspired gradient */}
      <div className="min-h-[600px] relative bg-gradient-to-t from-[#b273f3] to-[#7b5cc5] flex flex-col items-center justify-center px-6 md:px-24 text-white">
        <div
          className="absolute top-0 left-0 w-full h-8 bg-[length:1280px_32px] block"
          style={{
            animation: "move-horizontal 8s linear infinite",
            backgroundImage: "url(/top-wave.svg)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-full h-8 bg-[length:1280px_32px] block"
          style={{
            animation: "move-horizontal-reverse 8s linear infinite",
            backgroundImage: "url(/bottom-wave.svg)",
          }}
        ></div>
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Draw, Compete, Let AI Decide
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join the ultimate sketching showdown where your creativity meets
            artificial intelligence, powered by Supabase
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#7b5cc5] px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 flex items-center justify-center gap-2">
              Join Now <span className="ml-2">→</span>
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
            <div className="h-16 w-16 bg-[#b273f3] rounded-lg flex items-center justify-center mb-6">
              <Pencil className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Draw Your Best</h3>
            <p className="text-gray-600">
              Get creative with our intuitive drawing tools and complete
              challenges in real-time
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-[#7b5cc5] rounded-lg flex items-center justify-center mb-6">
              <Bot className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Evaluation</h3>
            <p className="text-gray-600">
              Advanced AI algorithms analyze and score your drawings instantly
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-16 w-16 bg-[#b273f3] rounded-lg flex items-center justify-center mb-6">
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
    </>
  );
}

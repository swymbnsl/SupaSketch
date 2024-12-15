"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navbar from "@/components/navbar";
import ParticlesBackground from "@/components/ParticlesBackground";

export default function Home() {
  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <Navbar />
      <ParticlesBackground />

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Left side - Text Content */}
        <div className="flex-1 pr-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            <span className="text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text [text-shadow:_0_0_30px_rgb(168_85_247_/_0.4)]">
              Draw to Win
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 max-w-2xl mb-12">
            Join the ultimate artistic battleground where creativity meets
            competition
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/join"
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-full text-xl font-bold hover:opacity-90 transition-all"
            >
              Start Your Journey
            </Link>
          </motion.div>

          {/* Powered by Supabase */}
          <div className="mt-16 flex items-center gap-3">
            <span className="text-gray-400">Powered by</span>
            <div className="relative group">
              <Image
                src="supabase-logo-wordmark--dark.svg"
                alt="Supabase"
                width={120}
                height={24}
                className="relative z-10"
              />
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-xl"
        />
      </div>
    </div>
  );
}

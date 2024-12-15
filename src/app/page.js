"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Navbar from "@/components/navbar";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Bot, Paintbrush, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-b from-black via-purple-950/10 to-black relative overflow-hidden">
      <Navbar />
      <ParticlesBackground />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Title with enhanced styling */}
            <div className="relative mb-8">
              <h1 className="text-7xl md:text-9xl font-bold tracking-tight">
                <span className="relative inline-block text-transparent bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 bg-clip-text animate-gradient-x">
                  Sketch &
                  <br />
                  Compete
                </span>
              </h1>
              <div className="absolute inset-0 blur-3xl bg-purple-500/20 -z-10" />
            </div>

            {/* Subtitle with improved contrast */}
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto">
              Create private rooms, invite friends, and let AI judge your
              artistic showdowns in real-time drawing competitions
            </p>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-16"
            >
              <Link
                href="/join"
                className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-12 py-5 rounded-full text-xl font-bold transition-all
                shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
                border border-purple-500/20 backdrop-blur-sm"
              >
                Create a Room
              </Link>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-16 relative z-20"
            >
              {[
                { icon: <Users className="w-6 h-6" />, text: "Private Rooms" },
                {
                  icon: <Paintbrush className="w-6 h-6" />,
                  text: "Real-time Drawing",
                },
                { icon: <Bot className="w-6 h-6" />, text: "AI Judging" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl text-gray-200 flex items-center gap-3 
                  shadow-lg transition-all border border-white/10 hover:border-purple-500/50"
                >
                  {feature.icon}
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Powered by Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="text-gray-400">Powered by</span>
              <div className="relative group">
                <Image
                  src="supabase-logo-wordmark--dark.svg"
                  alt="Supabase"
                  width={120}
                  height={24}
                  className="relative z-10 opacity-75 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-300" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Background Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [360, 0],
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          }}
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-[100px]"
        />
      </div>
    </div>
  );
}

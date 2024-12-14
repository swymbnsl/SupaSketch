"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Bot, Code, Pencil, Trophy, Users } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // GSAP Animations for sections
    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        animation: gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        }),
        toggleActions: "play none none reverse",
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black relative">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden bg-gradient-to-b from-black to-purple-900/20">
        <div id="particles-js" className="absolute inset-0 z-0"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 h-full flex items-center justify-center px-6 max-w-7xl mx-auto"
        >
          {/* Left side - Text Content */}
          <div className="flex-1 pr-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-text-glow">
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
          </div>

          {/* Right side - Demo/Animation */}
          <div className="flex-1 relative hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-transparent border border-purple-500/20 backdrop-blur-sm"
            >
              {/* You can replace this with your demo/animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Example: Animated Canvas Preview */}
                <div className="w-full h-full relative">
                  {/* Add your demo content here - could be:
                - A video showing app usage
                - An interactive canvas
                - An animated mockup
                - A 3D model
                - Screenshots carousel
            */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source
                      src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      type="video/mp4"
                    />
                  </video>

                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Demo Content Here
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-24"
          >
            Why Choose Us?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group hover:scale-105 transition-all duration-300"
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-transparent border border-purple-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  <div className="relative z-10">
                    <feature.icon className="w-12 h-12 mb-6 text-purple-400" />
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-black to-purple-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-24"
          >
            Our Impact
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                  {stat.value}
                </div>
                <div className="text-xl text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect with artists worldwide, share your work, and grow together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/50 to-transparent p-8 rounded-2xl border border-purple-500/20"
            >
              <h3 className="text-3xl font-bold mb-6">Weekly Challenges</h3>
              <p className="text-gray-400 mb-6">
                Participate in themed drawing challenges and compete with others
              </p>
              <Link
                href="/challenges"
                className="inline-block bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Challenges
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-pink-900/50 to-transparent p-8 rounded-2xl border border-pink-500/20"
            >
              <h3 className="text-3xl font-bold mb-6">Learning Resources</h3>
              <p className="text-gray-400 mb-6">
                Access tutorials, tips, and feedback from experienced artists
              </p>
              <Link
                href="/resources"
                className="inline-block bg-pink-600 px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Explore Resources
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-black to-purple-900/20">
        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-6xl font-bold mb-8">Ready to Begin?</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Start your artistic journey today and join thousands of creators
              worldwide
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-full text-xl font-bold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                Get Started Now
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform-origin-0 z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
}

const features = [
  {
    icon: Pencil,
    title: "Creative Freedom",
    description: "Express yourself with our advanced drawing tools and canvas",
  },
  {
    icon: Bot,
    title: "AI-Powered",
    description: "Get instant feedback and scoring from our advanced AI system",
  },
  {
    icon: Trophy,
    title: "Competitions",
    description:
      "Participate in daily and weekly challenges with great rewards",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow artists and share your creative journey",
  },
  {
    icon: Code,
    title: "Technology",
    description: "Built with cutting-edge tech for the smoothest experience",
  },
];

const stats = [
  { value: "50K+", label: "Active Artists" },
  { value: "100K+", label: "Artworks Created" },
  { value: "1M+", label: "Monthly Views" },
];

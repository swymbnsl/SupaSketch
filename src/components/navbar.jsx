import { playSound } from "@/utils/sound";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className="fixed w-full top-0 z-[100] backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="h-20 flex items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Logo on the left */}
        <div className="flex items-center relative group">
          <Link href="/">
            <div className="relative">
              <Image
                src="/image.png"
                alt="Logo"
                width={250}
                height={30}
                className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Links on the right */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <a
            href="https://github.com/swymbnsl/supasketch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors duration-200 flex items-center"
          >
            <Github className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>

          <Link
            href="/join"
            onClick={() => playSound.button()}
            className="relative inline-block bg-gradient-to-br from-purple-500 to-pink-600 px-6 py-2.5 rounded-full text-white font-medium transition-all
            shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
            border border-purple-500/20 backdrop-blur-sm hover:scale-105 active:scale-95"
          >
            Join a Room
          </Link>
        </div>
      </div>
    </div>
  );
}

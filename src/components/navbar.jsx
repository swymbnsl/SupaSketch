import { playSound } from "@/utils/sound";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className="fixed w-full top-0 z-[100] backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="h-16 sm:h-20 flex items-center justify-between px-3 sm:px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto">
        {/* Logo on the left */}
        <div className="flex items-center justify-center relative group">
          <Link href="/" className="flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <Image
                src="/image.png"
                alt="Logo"
                width={250}
                height={30}
                className="h-6 sm:h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Links on the right */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8">
          <a
            href="https://github.com/swymbnsl/supasketch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors duration-200 flex items-center justify-center p-1 sm:p-2"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </a>

          <Link
            href="/join"
            onClick={() => playSound.button()}
            className="relative inline-flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-white font-medium transition-all
            shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
            border border-purple-500/20 backdrop-blur-sm hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            <span className="hidden sm:inline">Join a Room</span>
            <span className="sm:hidden">Join</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className="fixed w-full top-0 z-[100] backdrop-blur-sm bg-black/50">
      <div className="h-24 flex items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Logo on the left */}
        <div className="flex items-center relative group">
          <Link href="/">
            <div className="relative">
              <Image
                src="/image.png"
                alt="Logo"
                width={250}
                height={30}
                className="h-8 sm:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        </div>

        {/* Links on the right */}
        <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-10">
          <a
            href="https://github.com/swymbnsl/supasketch"
            target="_blank"
            className="text-white/80 hover:text-white transition-colors flex items-center"
          >
            <Github className="w-6 h-6" />
          </a>

          <a
            href="/join"
            className="text-white/80 hover:text-white font-semibold transition-colors bg-purple-600/20 px-4 py-2 rounded-full hover:bg-purple-600/40 flex items-center"
          >
            Join a Room
          </a>
        </div>
      </div>
    </div>
  );
}

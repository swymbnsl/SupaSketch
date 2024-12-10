import { Github } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Navbar() {
  return (
    <div className="h-24 flex items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={250}
          height={30}
          className="h-8 sm:h-11"
        />
      </div>

      {/* Links on the right */}
      <div className="flex space-x-4 sm:space-x-6 md:space-x-10">
        <a
          href="https://github.com/swymbnsl/supasketch"
          target="_blank"
          className="text-black"
        >
          <Github />
        </a>

        <a href="/join" className="text-black font-semibold">
          Join a Room
        </a>
      </div>
    </div>
  );
}

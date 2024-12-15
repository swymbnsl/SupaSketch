"use client";

import AnimatedCursor from "react-animated-cursor";
import { usePathname } from "next/navigation";
import { useGameState } from "@/context/GameStateContext";

export default function CustomCursor() {
  const pathname = usePathname();
  const { gameStarted } = useGameState();

  const showCustomCursor = !(pathname === "/sketch" && gameStarted);

  if (!showCustomCursor) return null;

  return (
    <AnimatedCursor
      innerSize={8}
      outerSize={35}
      innerScale={1}
      outerScale={2}
      outerAlpha={0}
      hasBlendMode={true}
      innerStyle={{
        backgroundColor: "var(--cursor-color)",
      }}
      outerStyle={{
        border: "3px solid var(--cursor-color)",
      }}
    />
  );
}

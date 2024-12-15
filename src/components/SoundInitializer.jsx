"use client";

import { useEffect } from "react";
import { initializeSounds } from "@/utils/sound";

export default function SoundInitializer() {
  useEffect(() => {
    initializeSounds();
  }, []);

  return null;
}

"use client";

import Snd from "snd-lib";

const snd = new Snd();

export const initializeSounds = async () => {
  try {
    await snd.load(Snd.KITS.SND01);
    return true;
  } catch (error) {
    console.error("Failed to load sounds:", error);
    return false;
  }
};

export const playSound = {
  // Navigation & UI interactions
  click: () => snd.play(Snd.SOUNDS.TAP),
  select: () => snd.play(Snd.SOUNDS.SELECT),
  button: () => snd.play(Snd.SOUNDS.BUTTON),
  swipe: () => snd.play(Snd.SOUNDS.SWIPE),
  type: () => snd.play(Snd.SOUNDS.TYPE),

  // Toggles & Transitions
  toggleOn: () => snd.play(Snd.SOUNDS.TOGGLE_ON),
  toggleOff: () => snd.play(Snd.SOUNDS.TOGGLE_OFF),
  transitionUp: () => snd.play(Snd.SOUNDS.TRANSITION_UP),
  transitionDown: () => snd.play(Snd.SOUNDS.TRANSITION_DOWN),

  // Status & Notifications
  success: () => snd.play(Snd.SOUNDS.CELEBRATION),
  error: () => snd.play(Snd.SOUNDS.CAUTION),
  notification: () => snd.play(Snd.SOUNDS.NOTIFICATION),
  disabled: () => snd.play(Snd.SOUNDS.DISABLED),

  // Progress & Loading
  progress: () => snd.play(Snd.SOUNDS.PROGRESS_LOOP),
  ringtone: () => snd.play(Snd.SOUNDS.RINGTONE_LOOP),
};

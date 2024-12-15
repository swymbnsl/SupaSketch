"use client";

import { createContext, useContext, useState } from "react";

const GameStateContext = createContext();

export function GameStateProvider({ children }) {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <GameStateContext.Provider value={{ gameStarted, setGameStarted }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}

"use client";

const generateSessionToken = () => {
  return Math.random().toString(36).substring(2, 15); // Generates a random string
};
const storeSessionToken = (token) => {
  localStorage.setItem("session_token", token);
};

const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("session_token");
};

export { generateSessionToken, storeSessionToken, getSessionToken };

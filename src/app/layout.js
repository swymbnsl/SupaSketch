import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import CustomCursor from "@/components/CustomCursor";
import { GameStateProvider } from "@/context/GameStateContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "SupaSketch",
  description: "SupaSketch is a real-time drawing game with AI judges.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GameStateProvider>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <CustomCursor />
          <Toaster />
          {children}
        </body>
      </GameStateProvider>
    </html>
  );
}

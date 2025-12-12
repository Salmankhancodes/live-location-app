"use client";
import { useEffect, useState } from "react";
import Globe from "@/components/globe";
import LiveBadge from "@/components/livebadge";
import Link from "next/link";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-10 text-center mt-6 sm:mt-10 min-h-screen relative overflow-hidden">
      {/* Soft Gradient Spotlight Background */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* make sure it is responsive */}
      <div className="max-w-3xl w-full relative z-10">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-header">
          Share your <LiveBadge /> location with ease — instantly, securely.
        </h1>
        {/* 2 liner sub heading */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-secondary leading-relaxed">
          Whether you're meeting friends, coordinating with family, or ensuring safety, LiveLocation makes sharing your real-time location effortless and secure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm justify-center mb-8 sm:mb-12 mx-auto px-2 sm:px-0">
          <Link href="/share-location">
            <button className="w-full sm:w-auto bg-primary text-canvas px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1">
              Share My Location
            </button>
          </Link>
          <Link href="/track-location">
            <button className="w-full sm:w-auto border border-primary text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-primary/5 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              Track Someone
            </button>
          </Link>
        </div>
        <div className="w-full flex justify-center">
          <Globe />
        </div>
      </div>
      {/* Feature Section */}
      <div className="w-full px-4 sm:px-6 py-16 bg-canvas">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-header mb-4">
            Built for real-world moments
          </h2>
          <p className="text-secondary text-sm sm:text-base max-w-2xl mx-auto">
            Fast. Private. Reliable. LiveLocation is designed to help you stay
            connected with the people who matter, exactly when it matters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* CARD 1 */}
          <div className="p-6 bg-white rounded-2xl border border-surface shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-primary text-3xl mb-4">📡</div>
            <h3 className="text-lg font-semibold text-header mb-2">Share Instantly</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Start a session in one tap with a secure, anonymous session ID.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="p-6 bg-white rounded-2xl border border-surface shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-primary text-3xl mb-4">🛰️</div>
            <h3 className="text-lg font-semibold text-header mb-2">Track in Real Time</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Smooth map updates with live GPS movement as it happens.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="p-6 bg-white rounded-2xl border border-surface shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="text-primary text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-header mb-2">Stay in Control</h3>
            <p className="text-secondary text-sm leading-relaxed">
              You choose when tracking ends. Sessions auto-expire for privacy.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
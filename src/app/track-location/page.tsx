"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";

export default function TrackPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");

  const handleTrack = () => {
    if (!sessionId.trim()) {
      alert("Please enter a valid session ID");
      return;
    }
    router.push(`/track-location/${sessionId.trim()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h2 className="text-2xl font-semibold text-header mb-4">
        Track a Live Location
      </h2>

      <p className="text-secondary mb-6">
        Enter the session ID shared by someone to view their live location:
      </p>

      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter session ID"
        className="w-full max-w-sm px-4 py-2 mb-4 rounded bg-surface text-header border border-secondary focus:outline-none"
      />

      <Button
        onClick={handleTrack}
        className="bg-primary text-canvas px-6 py-3 rounded-lg w-full max-w-sm"
      >
        Track Location
      </Button>
    </div>
  );
}

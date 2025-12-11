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
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Enter Session ID to Track</h1>

      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter session ID"
        className="border p-2 rounded w-full"
      />

      <Button
        onClick={handleTrack}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Track Location
      </Button>
    </div>
  );
}

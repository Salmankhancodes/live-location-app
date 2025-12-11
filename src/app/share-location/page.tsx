"use client";

import { createSession, getSession } from "@/lib/firebase/db";
import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import Button from "@/components/button";
import { onAuthReady } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ShareLocation() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const didRun = useRef(false);

  const createNewSessionAndUpdateLocalStorage = async () => {
    const newId = nanoid(10);
    await createSession(newId);
    localStorage.setItem("sessionId", newId);
    setSessionId(newId);
    setLoading(false);
    console.log("Created new session with ID:", newId);
  }


  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const setup = async () => {
      await new Promise<void>((resolve) => {
        onAuthReady(() => resolve());
      });

      const existingSessionId = localStorage.getItem("sessionId");
      if (existingSessionId) {
        console.log("Existing session found:", existingSessionId);
        const session = await getSession(existingSessionId);
        if (session && session.isActive === true) {
          setSessionId(existingSessionId);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem("sessionId");
          await createNewSessionAndUpdateLocalStorage();
          return;
        }
      } else {
        await createNewSessionAndUpdateLocalStorage();
      }
    };
    setup().catch((e) => {
      console.error("Session setup error", e);
      setLoading(false);
    });
  }, []);

  const handleStartSharing = () => {
    if (!sessionId) return;
    router.push(`/share-location/${sessionId}`);
  };

  const handleCopySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    alert("Session ID copied!");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-secondary">
        Initializing session...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h2 className="text-2xl font-semibold text-header mb-4">
        Your Live Location Session
      </h2>

      <p className="text-secondary mb-6">
        Share this session ID with anyone who wants to track you:
      </p>

      {sessionId && (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <span className="font-mono bg-surface px-4 py-2 rounded text-header">
            {sessionId}
          </span>
          <Button
            onClick={handleCopySessionId}
            className="bg-primary text-canvas px-4 py-2 rounded"
          >
            Copy
          </Button>
        </div>
      )}

      <Button
        onClick={handleStartSharing}
        className="bg-primary text-canvas px-6 py-3 rounded-lg"
      >
        Open Map
      </Button>
    </div>
  );
}

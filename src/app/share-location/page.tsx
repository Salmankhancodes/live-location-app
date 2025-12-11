"use client";

import { createSession, getSession } from "@/lib/firebase/db";
import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import Button from "@/components/button";
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
      const existingSessionId = localStorage.getItem("sessionId");
      if (existingSessionId) {
        console.log("Existing session found:", existingSessionId);
        const session = await getSession(existingSessionId);
        console.log("Fetched session data:", session);
        if (session && session.isActive === true) {
          setSessionId(existingSessionId);
          setLoading(false);
          console.log("Reusing existing active session.");
          return;
        }
        else {
          console.log("Existing session is inactive or does not exist. Removing stored session ID.");
          localStorage.removeItem("sessionId");
          await createNewSessionAndUpdateLocalStorage();
          return;
        }
      }
      else {
        console.log("No existing session found. Creating a new one.");
        const newId = nanoid(10);
        await createNewSessionAndUpdateLocalStorage();
        return;
      }
    };

    setup();
  }, []);


  const handleStartSharing = () => {
    if (!sessionId) return;
    router.push(`/share-location/${sessionId}`);
  };

  if (loading) return <div>Initializing session...</div>;

  return (
    <div>
      Sharing screen — session initialized!
      <Button onClick={handleStartSharing} className="mt-4">
        Open Map
      </Button>
    </div>
  );
}

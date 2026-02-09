"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

import Button from "@/components/button";
import { createSession, getSession } from "@/lib/firebase/db";
import { db, onAuthReady } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stopSession = async (sessionId: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, { isActive: false, lastLocation: null, endedAt: new Date() });

};
type PageState =
  | "auth-check"
  | "auth-failed"
  | "session-check"
  | "no-session"
  | "session-inactive"
  | "creating"
  | "active";

export default function ShareLocation() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("auth-check");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ----------------------------------
  // INITIAL SETUP
  // ----------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ Wait for auth (with 10s timeout)
        await new Promise<void>((resolve, reject) => {
          let settled = false;
          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true;
              reject(new Error("Auth timeout"));
            }
          }, 10000);
          onAuthReady((user) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            if (!user) reject(new Error("Auth failed"));
            else resolve();
          });
        });
      } catch {
        setPageState("auth-failed");
        return;
      }

      setPageState("session-check");

      // 2️⃣ Check existing session
      const storedSessionId = localStorage.getItem("sessionId");

      if (!storedSessionId) {
        setPageState("no-session");
        return;
      }

      const session = await getSession(storedSessionId);

      if (!session) {
        localStorage.removeItem("sessionId");
        setPageState("no-session");
        return;
      }

      if (session.isActive) {
        setSessionId(storedSessionId);
        setPageState("active");
      } else {
        setPageState("session-inactive");
      }
    };

    init().catch(() => setPageState("auth-failed"));
  }, []);

  // ----------------------------------
  // ACTIONS
  // ----------------------------------
  const handleCreateSession = async () => {
    // Pre-check geolocation support
    if (!("geolocation" in navigator)) {
      alert("Your browser does not support geolocation. Location sharing requires GPS access.");
      return;
    }

    // Pre-check if location permission is already denied
    try {
      const permResult = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (permResult.state === "denied") {
        alert("Location permission is blocked. Please enable it in your browser settings to share your location.");
        return;
      }
    } catch {
      // Permissions API not supported — continue anyway
    }

    setPageState("creating");

    try {
      const newId = nanoid(10);
      await createSession(newId);

      localStorage.setItem("sessionId", newId);
      setSessionId(newId);
      setPageState("active");
    } catch (err) {
      console.error("Failed to create session:", err);
      setPageState("no-session");
      alert("Failed to create session. Please check your connection and try again.");
    }
  };

  const handleStopSession = async () => {
    if (!sessionId) return;

    try {
      await stopSession(sessionId);
    } catch (err) {
      console.error("Failed to stop session:", err);
    }

    // Always clean up local state even if the remote call fails
    localStorage.removeItem("sessionId");
    setSessionId(null);
    setPageState("session-inactive");
  };

  const handleOpenMap = () => {
    if (!sessionId) return;
    router.push(`/share-location/${sessionId}`);
  };

  const handleCopy = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    alert("Session ID copied");
  };

  // ----------------------------------
  // ---------- UI ----------
  if (pageState === "auth-check" || pageState === "session-check") {
    return <CenteredText>Checking session…</CenteredText>;
  }

  if (pageState === "auth-failed") {
    return (
      <Centered>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 mb-4">
            Authentication failed. Unable to start sharing.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Centered>
    );
  }

  if (pageState === "creating") {
    return <CenteredText>Creating session…</CenteredText>;
  }

  if (pageState === "no-session" || pageState === "session-inactive") {
    return (
      <Centered>
        {/* Status Header */}
        <StatusHeader status="idle" label="No Active Session" />

        {/* Card */}
        <div className="bg-canvas rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2">
            Start sharing location
          </h2>
          <p className="text-secondary mb-6">
            No active session found. Create a new one to begin.
          </p>

          <Button className="w-full" onClick={handleCreateSession}>
            Create Session
          </Button>
        </div>
      </Centered>
    );
  }

  // ---------- ACTIVE SESSION ----------
  return (
    <Centered>
      {/* Status Header */}
      <StatusHeader status="active" label="Session Active" />

      {/* Session Card */}
      <div className="bg-canvas rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-1">
          Live Location Session
        </h2>
        <p className="text-secondary text-sm mb-6">
          Share this session ID with trackers
        </p>

        {/* Session ID */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <span className="font-mono text-sm bg-surface px-4 py-2 rounded-lg">
            {sessionId}
          </span>
          <button onClick={handleCopy} className="text-sm text-primary hover:underline">
            Copy
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleOpenMap}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-xl
                     hover:bg-primary/90 transition-all duration-300
                     shadow-md hover:shadow-lg"
          >
            Open Live Map
          </button>

          <button
            onClick={handleStopSession}
            className="px-4 py-2 border border-red-300 text-red-600
                     rounded-xl hover:bg-red-50 transition-colors duration-300"
          >
            Stop
          </button>
        </div>
      </div>

      <SessionInfoNote />
    </Centered>
  );

  /* ---------- UI helpers ---------- */

  function StatusHeader({ status, label }: { status: "active" | "idle"; label: string }) {
    const color =
      status === "active"
        ? "bg-green-500"
        : status === "idle"
          ? "bg-yellow-500"
          : "bg-red-500";

    return (
      <div className="flex items-center gap-2 mb-6">
        <span
          className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse`}
        />
        <span className="text-sm text-secondary">{label}</span>
      </div>
    );
  }

  function SessionInfoNote() {
    return (
      <div className="mt-5 flex items-start gap-2 text-xs text-secondary bg-surface px-4 py-3 rounded-xl max-w-md">
        <span className="mt-0.5 text-primary">ℹ️</span>
        <p className="leading-relaxed text-left text-sm">
          Location updates only while the map is open.
          Closing the map pauses sharing automatically.
        </p>
      </div>
    );
  }

  function Centered({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        {children}
      </div>
    );
  }

  function CenteredText({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-secondary">
        {children}
      </div>
    );
  }
}
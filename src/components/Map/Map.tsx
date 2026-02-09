"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/firebase/db";

type SessionStatus = "loading" | "active" | "ended" | "invalid" | "waiting";

export default function MapWindow({
  sessionId,
  mode,
}: {
  sessionId: string;
  mode: "share" | "track";
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";

  /* ----------------------------------------
     CLEANUP & EXIT (used everywhere)
  ---------------------------------------- */
  const cleanupAndExit = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    markerRef.current?.remove();
    markerRef.current = null;

    router.replace("/share-location");
  };

  /* ----------------------------------------
     MAP INIT
  ---------------------------------------- */
  useEffect(() => {
    if (!mapContainer.current || !maptilerKey) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${maptilerKey}`,
      center: [77.209, 28.613],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => setReady(true));

    return () => map.remove();
  }, []);

  /* ----------------------------------------
     ONLINE / OFFLINE DETECTION
  ---------------------------------------- */
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  /* ----------------------------------------
     VERIFY OWNER (SHARER ONLY)
  ---------------------------------------- */
  useEffect(() => {
    if (mode !== "share") return;

    const verifyOwner = async () => {
      const session = await getSession(sessionId);
      const uid = auth.currentUser?.uid;

      if (!session) {
        router.replace("/share-location");
        return;
      }

      if (session.owner !== uid) {
        router.replace(`/track-location/${sessionId}`);
      }
    };

    verifyOwner();
  }, [mode, sessionId]);

  /* ----------------------------------------
     LISTEN SESSION (BOTH MODES)
     -> BE expiry handled here
  ---------------------------------------- */
  useEffect(() => {
    const sessionRef = doc(db, "sessions", sessionId);

    const unsub = onSnapshot(
      sessionRef,
      (snap) => {
        if (!snap.exists()) {
          setSessionStatus("invalid");
          cleanupAndExit();
          return;
        }

        const data = snap.data();

        if (data.isActive === false) {
          setSessionStatus("ended");
          markerRef.current?.remove();
          markerRef.current = null;

          if (mode === "share") cleanupAndExit();
          return;
        }

        // In track mode, the tracker listener manages active/waiting status
        if (mode === "share") {
          setSessionStatus("active");
        }
      },
      (error) => {
        console.error("Session listener error:", error);
        setSessionStatus("invalid");
      }
    );

    return () => unsub();
  }, [sessionId, mode]);

  /* ----------------------------------------
     SHARER MODE – LOCATION UPDATE
  ---------------------------------------- */
  useEffect(() => {
    if (!ready || mode !== "share") return;

    if (!("geolocation" in navigator)) {
      setLocationError("Your browser does not support geolocation. Please use a modern browser.");
      return;
    }

    const sessionRef = doc(db, "sessions", sessionId);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        setLocationError(null);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ color: "#4ade80" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
          mapRef.current!.flyTo({ center: [lng, lat], zoom: 15 });
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }

        try {
          await updateDoc(sessionRef, {
            lastLocation: { lat, lng },
            updatedAt: new Date(),
          });
        } catch {
          // Firestore write failed — session may have expired
          cleanupAndExit();
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(
              "Location permission denied. Please allow location access in your browser settings and reload."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError(
              "Location unavailable. Please make sure your device's GPS / location services are turned on."
            );
            break;
          case err.TIMEOUT:
            setLocationError(
              "Location request timed out. Please check your GPS signal and try again."
            );
            break;
          default:
            setLocationError("An unknown location error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [ready, mode, sessionId]);

  /* ----------------------------------------
     TRACKER MODE – LOCATION LISTEN
  ---------------------------------------- */
  useEffect(() => {
    if (!ready || mode !== "track") return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsub = onSnapshot(
      sessionRef,
      (snap) => {
        if (!snap.exists()) {
          setSessionStatus("invalid");
          return;
        }

        const data = snap.data();

        if (data.isActive === false) {
          setSessionStatus("ended");
          markerRef.current?.remove();
          markerRef.current = null;
          return;
        }

        const loc = data.lastLocation;
        if (loc?.lat == null || loc?.lng == null) {
          setSessionStatus("waiting");
          return;
        }

        setSessionStatus("active");

        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ color: "#60a5fa" })
            .setLngLat([loc.lng, loc.lat])
            .addTo(mapRef.current!);
          mapRef.current!.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
        } else {
          markerRef.current.setLngLat([loc.lng, loc.lat]);
        }
      },
      (error) => {
        console.error("Tracker listener error:", error);
        setSessionStatus("invalid");
      }
    );

    return () => unsub();
  }, [ready, mode, sessionId]);

  /* ----------------------------------------
     STOP SHARING (MANUAL)
  ---------------------------------------- */
  const handleStopSharing = async () => {
    cleanupAndExit();

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      endedAt: new Date(),
    });
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  if (!maptilerKey) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-gray-50 rounded-lg shadow-lg">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 font-medium">Map configuration error</p>
          <p className="text-red-500 text-sm mt-2">
            Map tile key is not configured. Please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] relative bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Offline banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-yellow-500 text-yellow-900 text-center text-sm py-2 font-medium">
          You are offline — location updates paused
        </div>
      )}

      {/* Sharer controls + location error */}
      {mode === "share" && (
        <>
          <button
            onClick={handleStopSharing}
            className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Stop Sharing
          </button>

          {locationError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-sm">
              <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm text-center">
                {locationError}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tracker status badges */}
      {mode === "track" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          {sessionStatus === "loading" && (
            <div className="bg-yellow-400 px-4 py-2 rounded shadow">
              Connecting…
            </div>
          )}
          {sessionStatus === "waiting" && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded shadow animate-pulse">
              Waiting for sharer to send location…
            </div>
          )}
          {sessionStatus === "invalid" && (
            <div className="bg-red-600 text-white px-4 py-2 rounded shadow">
              Invalid session ❌
            </div>
          )}
          {sessionStatus === "ended" && (
            <div className="bg-gray-800 text-white px-4 py-2 rounded shadow">
              Session ended 🚫
            </div>
          )}
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import Button from "../button";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/firebase/db";

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
  const [sessionStatus, setSessionStatus] = useState<"active" | "ended" | "invalid" | "loading">("loading");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const mapfileKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
  // ----------------------------------------
  // MAP INITIALIZATION
  // ----------------------------------------
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${mapfileKey}`,
      center: [77.209, 28.613],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => setReady(true));

    return () => map.remove();
  }, []);

  // -------------------------------
  // VERIFY OWNER (Sharer only)
  // -------------------------------
  useEffect(() => {
    if (mode !== "share") return;

    const verifyOwner = async () => {
      const session = await getSession(sessionId);
      const currentUid = auth.currentUser?.uid;

      if (!session) {
        router.replace("/share-location");
        return;
      }

      if (session.owner !== currentUid) {
        router.replace(`/track-location/${sessionId}`);
        return;
      }
    };

    verifyOwner();
  }, [mode, sessionId]);

  // -------------------------------
  // SHARER MODE
  // -------------------------------
  useEffect(() => {
    if (!ready || mode !== "share") return;
    if (!("geolocation" in navigator)) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ color: "#4ade80" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
          mapRef.current!.flyTo({ center: [lng, lat], zoom: 15 });
        } else markerRef.current.setLngLat([lng, lat]);

        await updateDoc(sessionRef, {
          lastLocation: { lat, lng },
          updatedAt: new Date(),
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [ready, mode, sessionId]);

  // -------------------------------
  // TRACKER MODE
  // -------------------------------
  useEffect(() => {
    if (!ready || mode !== "track") return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsub = onSnapshot(sessionRef, (snap) => {
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

      setSessionStatus("active");

      const loc = data.lastLocation;
      if (!loc?.lat || !loc?.lng) return;

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#60a5fa" })
          .setLngLat([loc.lng, loc.lat])
          .addTo(mapRef.current!);
        mapRef.current!.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
      } else markerRef.current.setLngLat([loc.lng, loc.lat]);
    });

    return () => unsub();
  }, [ready, mode, sessionId]);

  // -------------------------------
  // STOP SHARING BUTTON
  // -------------------------------
  const handleStopSharing = async () => {
    navigator.geolocation.clearWatch(watchIdRef.current!);
    watchIdRef.current = null;

    markerRef.current?.remove();
    markerRef.current = null;

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, { isActive: false, lastLocation: null, endedAt: new Date() });

    router.push("/share-location");
  };

  return (
    <div className="w-full h-[80vh] relative bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* STOP SHARING BUTTON */}
      {mode === "share" && (
        <button
          className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          onClick={handleStopSharing}
        >
          Stop Sharing
        </button>
      )}

      {/* STATUS TOAST */}
      {mode === "track" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          {sessionStatus === "loading" && (
            <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded shadow-lg animate-pulse">
              Connecting…
            </div>
          )}
          {sessionStatus === "invalid" && (
            <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg">
              Invalid session ID ❌
            </div>
          )}
          {sessionStatus === "ended" && (
            <div className="bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
              Sharer has stopped sharing 🚫
            </div>
          )}
        </div>
      )}

      {/* MAP */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

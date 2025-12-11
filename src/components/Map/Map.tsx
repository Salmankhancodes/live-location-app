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
      style:
        `https://api.maptiler.com/maps/openstreetmap/style.json?key=${mapfileKey}`,
      center: [77.209, 28.613], // Delhi default
      zoom: 12,
    });

    mapRef.current = map;

    map.on("load", () => {
      setReady(true);
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (mode !== "share") return;

    const verifyOwner = async () => {
      const session = await getSession(sessionId);
      const currentUid = auth.currentUser?.uid;

      if (!session) {
        alert("Session does not exist.");
        router.replace("/share");
        return;
      }

      if (session.owner !== currentUid) {
        alert("You are not the owner of this session. Switching to tracker mode.");
        router.replace(`/track-location/${sessionId}`);
        return;
      }

      // Owner verified → continue normal sharer logic
    };

    verifyOwner();
  }, [mode, sessionId]);

  // ----------------------------------------
  // ⭐ SHARER MODE — unchanged logic
  // ----------------------------------------
  useEffect(() => {
    if (!ready) return;
    if (mode !== "share") return;

    if (!("geolocation" in navigator)) {
      alert("Location not supported");
      return;
    }

    const sessionRef = doc(db, "sessions", sessionId);
    console.log("Starting share mode for session:", sessionId);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // PLACE MARKER (green)
        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ color: "green" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);

          mapRef.current!.flyTo({
            center: [lng, lat],
            zoom: 15,
          });
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }

        // UPDATE FIRESTORE
        await updateDoc(sessionRef, {
          lastLocation: { lat, lng },
          updatedAt: new Date(),
        });
      },
      (err) => console.error("Location error", err),
      { enableHighAccuracy: true }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [ready, mode, sessionId]);

  // ----------------------------------------
  // ⭐ TRACKER MODE — NEW LOGIC
  // ----------------------------------------
  useEffect(() => {
    if (!ready) return;
    if (mode !== "track") return;

    const sessionRef = doc(db, "sessions", sessionId);

    // Realtime listener for sharer updates
    const unsub = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) {
        setSessionStatus("invalid");
        return;
      }

      const data = snap.data();

      // ❌ Sharer has stopped sharing
      if (data.isActive === false) {
        setSessionStatus("ended");

        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        return;
      }

      // 🟢 Sharer is active → track location
      setSessionStatus("active");

      const loc = data.lastLocation;
      if (!loc || !loc.lat || !loc.lng) return;

      // Place or update tracker marker
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "blue" })
          .setLngLat([loc.lng, loc.lat])
          .addTo(mapRef.current!);

        mapRef.current!.flyTo({
          center: [loc.lng, loc.lat],
          zoom: 15,
        });
      } else {
        markerRef.current.setLngLat([loc.lng, loc.lat]);
      }
    });

    return () => {
      unsub();
    };
  }, [ready, mode, sessionId]);
  // ------------------------------
  // ⭐ STOP SHARING HANDLER
  // ------------------------------
  const handleStopSharing = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      lastLocation: null,
      endedAt: new Date(),
    });

    alert("Location sharing stopped.");
    router.push("/share-location");
  };

  return (
    <div className="w-full h-[80vh] relative">
      {mode === "share" && <Button style={{ position: "absolute", zIndex: 10, top: 30, right: 30 }} onClick={handleStopSharing}>Stop Sharing</Button>}
      {mode === "track" && sessionStatus === "loading" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded">
          Connecting…
        </div>
      )}

      {mode === "track" && sessionStatus === "invalid" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-10">
          Invalid session ID ❌
        </div>
      )}

      {mode === "track" && sessionStatus === "ended" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded z-10">
          Sharer has stopped sharing 🚫
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full relative" />
    </div>
  );
}

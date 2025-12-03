"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export default function UserLocationMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map with any default center
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`,
      center: [0, 0],
      zoom: 2,
    });

    map.on("load", () => {
      console.log("map loaded");

      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userLoc: [number, number] = [longitude, latitude];
          console.log("User location:", userLoc);

          // Jump to user location
          map.flyTo({
            center: userLoc,
            zoom: 16,
            speed: 1.2,
          });

          // Add marker at user location
          new maplibregl.Marker({ color: "red" })
            .setLngLat(userLoc)
            .addTo(map);
        },
        (err) => {
          console.error(err);
          alert("Error fetching location");
        },
        {
          enableHighAccuracy: true,
        }
      );
    });

    return () => map.remove();
  }, []);
  return <div ref={containerRef} className="w-full h-full" />;

}

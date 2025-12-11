"use client";
import Button from "@/components/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-20 text-center">
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-header">
        Welcome to LiveLocation
      </h1>

      {/* Subheading */}
      <p className="text-base md:text-lg mb-8 text-secondary max-w-md">
        Track live locations seamlessly and efficiently.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
        <Link href="/share-location">
          <button className="w-full sm:w-auto bg-primary text-canvas px-6 py-3 rounded-lg">
            Share My Location
          </button>
        </Link>
        <Link href="/track-location">
          <button className="w-full sm:w-auto bg-secondary text-canvas px-6 py-3 rounded-lg">
            Track Someone
          </button>
        </Link>
      </div>
    </div>)
}
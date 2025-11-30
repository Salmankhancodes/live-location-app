"use client";
import Button from "@/components/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Live Location App</h1>
      <p className="text-lg text-gray-700">Track live location seamlessly and efficiently.</p>
      <div className="flex gap-5 mt-5">
        <Link href="/share-location">
          <Button
            label="Share"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
        </Link>
        <Link href="/track-location">
          <Button
            label="Track"
          />
        </Link>
      </div>
    </div>
  )
}
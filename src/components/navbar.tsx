"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-header px-4 py-3">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="text-canvas text-xl font-semibold">LiveLocation</div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-canvas">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/share-location">Share</Link></li>
          <li><Link href="/track-location">Track</Link></li>
        </ul>

        {/* Hamburger button */}
        <button
          className="md:hidden text-canvas"
          onClick={() => setOpen(!open)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <ul className="md:hidden mt-2 space-y-2 text-canvas">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/share">Share</Link></li>
          <li><Link href="/track">Track</Link></li>
        </ul>
      )}
    </nav>
  );
}

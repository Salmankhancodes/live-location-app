"use client";
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-5 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-gray-900 text-2xl font-bold group-hover:text-primary transition-colors duration-300">
              LiveLocation
            </div>
          </Link>

          {/* Desktop CTA Buttons - Always Visible */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <Link href="/track-location">
              <button className="px-4 sm:px-6 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all duration-300 text-sm sm:text-base">
                Track
              </button>
            </Link>
            <Link href="/share-location">
              <button className="px-4 sm:px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 text-sm sm:text-base">
                Share
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="sm:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            <div className="flex gap-3 pt-2">
              <Link href="/track-location" className="flex-1" onClick={() => setOpen(false)}>
                <button className="w-full px-4 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all duration-300">
                  Track
                </button>
              </Link>
              <Link href="/share-location" className="flex-1" onClick={() => setOpen(false)}>
                <button className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                  Share
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

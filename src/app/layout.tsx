import Link from 'next/link'
import './globals.css'
export const metadata = {
  title: 'Live Location App',
  description: 'Track live location',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <nav className="sticky top-0 z-10 bg-white shadow-md">
          <ul className="flex gap-4 p-4">
            <li><Link href="/" className="text-black font-semibold">Home</Link></li>
            <li><Link href="/share-location" className="text-black font-semibold">Share Location</Link></li>
            <li><Link href="/track-location" className="text-black font-semibold">Track Location</Link></li>
          </ul>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}

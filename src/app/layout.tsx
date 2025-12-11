import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/navbar'
export const metadata = {
  title: 'Live Location App',
  description: 'Track live location',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col bg-canvas">
        <Navbar />
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}

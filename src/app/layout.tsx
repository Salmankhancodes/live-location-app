import './globals.css'
export const metadata = {
  title: 'Live Location App',
  description: 'Track live location',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <nav>
          <ul className="flex gap-4 p-4 bg-white shadow-md">
            <li><a href="/" className="text-black font-semibold">Home</a></li>
            {/* these are temporary buttons and will not be allowed to move between pages untill user is tracking/sharing */}
            <li><a href="/share-location" className="text-black font-semibold">Share Location</a></li>
            <li><a href="/track-location" className="text-black font-semibold">Track Location</a></li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  )
}

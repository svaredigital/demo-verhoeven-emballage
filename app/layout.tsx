import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Verhoeven Zagerij - EUDR Demo',
  description: 'EUDR Traceability System Demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-wood-light to-sage-green">
          <header className="bg-wood-brown text-white p-4 shadow-lg">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">Verhoeven Zagerij - EUDR Systeem</h1>
              <p className="text-wood-light">Demo Traceability Systeem</p>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <header className="bg-verhoeven-green text-white p-6 shadow-lg">
            <div className="container mx-auto">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                  <Image 
                    src="/verhoeven-logo.svg" 
                    alt="Verhoeven's Zagerij en Houthandel" 
                    width={275} 
                    height={59}
                    priority
                    style={{ width: '220px', height: 'auto' }}
                  />
                </Link>
                <div className="border-l border-verhoeven-gold pl-6 h-12 flex flex-col justify-center">
                  <h1 className="text-xl font-bold leading-tight">EUDR Traceability Systeem</h1>
                  <p className="text-verhoeven-gold text-sm">Demo Applicatie</p>
                </div>
              </div>
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
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-verhoeven-green mb-2">
          Welkom bij het EUDR Traceability Systeem
        </h1>
        <p className="text-gray-600 mb-4">
          Demo applicatie voor Verhoeven Zagerij
        </p>
        {mounted && currentTime && (
          <p className="text-sm text-gray-500">
            Huidige tijd: {currentTime.toLocaleString('nl-NL')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* EUDR Validatie */}
        <Link href="/eudr-validatie" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              1
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">EUDR Validatie</h2>
          </div>
          <p className="text-gray-600">
            Chauffeur vult EUDR nummer in en valideert via TRACES systeem
          </p>
        </Link>

        {/* Ontvangst Registratie */}
        <Link href="/ontvangst" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">Ontvangst</h2>
          </div>
          <p className="text-gray-600">
            Registreer leverancier, CMR nummer, PEFC nummer en andere details
          </p>
        </Link>

        {/* Voorraad */}
        <Link href="/voorraad" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              3
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">Voorraad</h2>
          </div>
          <p className="text-gray-600">
            Overzicht van huidige voorraad met TRACES IDs
          </p>
        </Link>

        {/* Productie Run */}
        <Link href="/productie" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              4
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">Productie Run</h2>
          </div>
          <p className="text-gray-600">
            Start nieuwe productie run met weekly batch nummers
          </p>
        </Link>

        {/* Batch Rapport */}
        <Link href="/rapporten" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              5
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">Rapporten</h2>
          </div>
          <p className="text-gray-600">
            Batch uitkomsten en traceability rapporten
          </p>
        </Link>

        {/* Overzicht */}
        <Link href="/dashboard" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-sage-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
              📊
            </div>
            <h2 className="ml-4 text-xl font-semibold text-verhoeven-green">Dashboard</h2>
          </div>
          <p className="text-gray-600">
            Volledig overzicht van alle processen en data
          </p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-verhoeven-green mb-3">Proces Flow</h3>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="bg-forest-green text-white px-3 py-1 rounded">EUDR Validatie</span>
          <span className="text-gray-400">→</span>
          <span className="bg-forest-green text-white px-3 py-1 rounded">Ontvangst</span>
          <span className="text-gray-400">→</span>
          <span className="bg-forest-green text-white px-3 py-1 rounded">Voorraad</span>
          <span className="text-gray-400">→</span>
          <span className="bg-forest-green text-white px-3 py-1 rounded">Productie</span>
          <span className="text-gray-400">→</span>
          <span className="bg-forest-green text-white px-3 py-1 rounded">Rapport</span>
        </div>
      </div>
    </div>
  )
}
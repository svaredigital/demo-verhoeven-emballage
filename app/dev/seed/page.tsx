"use client"

import { useState } from "react"

export default function DevSeedPage() {
  const [msg, setMsg] = useState<string | null>(null)

  function seed() {
    const now = new Date().toISOString()

    const voorraad = [
      {
        id: 'v1',
        tracesId: 't-100',
        ontvangstId: 'o-100',
        maatvoering: '4x2.5m',
        houtType: 'Grenen',
        volume: 10,
        beschikbaarVolume: 10,
        leverancier: 'Demo Leverancier',
        ontvangstDatum: now,
        status: 'beschikbaar'
      },
      {
        id: 'v2',
        tracesId: 't-101',
        ontvangstId: 'o-101',
        maatvoering: '3x2m',
        houtType: 'Vuren',
        volume: 8,
        beschikbaarVolume: 8,
        leverancier: 'Demo Leverancier',
        ontvangstDatum: now,
        status: 'beschikbaar'
      }
    ]

    const productieRuns = [
      {
        id: 'r1',
        batchNummer: 'BATCH-001',
        productieWeek: '2025-W47',
        status: 'voltooid',
        gebruikteTraces: ['t-100','t-101'],
        outputProducts: [
          { id: 'p-chips', naam: 'Chips', hoeveelheid: 5, eenheid: 'M3' },
          { id: 'p-zaagsel', naam: 'Zaagsel', hoeveelheid: 2, eenheid: 'tonnen' },
          { id: 'p-palleten-euro', naam: 'Pallets Euro', hoeveelheid: 12, eenheid: 'stuks' },
          { id: 'p-palleten-bewerkt', naam: 'Pallets Bewerkt', hoeveelheid: 8, eenheid: 'stuks' }
        ],
        createdAt: now
      }
    ]

    const producten = [
      { id: 'p-chips', naam: 'Chips', hoeveelheid: 5, eenheid: 'M3', batchNummer: 'BATCH-001', productieRunId: 'r1', createdAt: now },
      { id: 'p-zaagsel', naam: 'Zaagsel', hoeveelheid: 2, eenheid: 'tonnen', batchNummer: 'BATCH-001', productieRunId: 'r1', createdAt: now },
      { id: 'p-palleten-euro', naam: 'Pallets Euro', hoeveelheid: 12, eenheid: 'stuks', batchNummer: 'BATCH-001', productieRunId: 'r1', createdAt: now },
      { id: 'p-palleten-bewerkt', naam: 'Pallets Bewerkt', hoeveelheid: 8, eenheid: 'stuks', batchNummer: 'BATCH-001', productieRunId: 'r1', createdAt: now }
    ]

    localStorage.setItem('voorraad', JSON.stringify(voorraad))
    localStorage.setItem('productieRuns', JSON.stringify(productieRuns))
    localStorage.setItem('producten', JSON.stringify(producten))

    setMsg('Seeded demo data: voorraad, productieRuns, producten')
  }

  function clearData() {
    localStorage.removeItem('voorraad')
    localStorage.removeItem('productieRuns')
    localStorage.removeItem('producten')
    setMsg('Cleared demo data')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dev: Seed demo data</h1>
      <p className="mb-4">Deze pagina vult de browser localStorage met voorbeeld-voorraad en een productie run. Alleen client-side.</p>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={seed}>Seed demo data</button>
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={clearData}>Clear demo data</button>
      </div>
      {msg && <div className="mt-4 p-3 bg-gray-100 rounded">{msg}</div>}
      <div className="mt-6 text-sm text-gray-600">Na seeden, ga naar <code className="bg-gray-50 p-1 rounded">/voorraad</code>, <code className="bg-gray-50 p-1 rounded">/productie</code> of <code className="bg-gray-50 p-1 rounded">/rapporten</code> om de data te zien.</div>
    </div>
  )
}

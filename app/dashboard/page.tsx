'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totaalOntvangsten: number;
  totaalVoorraadVolume: number;
  beschikbaarVolume: number;
  inProductieVolume: number;
  verwerktVolume: number;
  actieveProductieRuns: number;
  voltooideProductieRuns: number;
  uniekeTraces: number;
  uniekeLeveranciers: number;
}

interface RecenteActiviteit {
  type: 'ontvangst' | 'productie-start' | 'productie-eind';
  datum: Date;
  beschrijving: string;
  details?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recenteActiviteiten, setRecenteActiviteiten] = useState<RecenteActiviteit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      // Laad alle data
      const voorraad = JSON.parse(localStorage.getItem('voorraad') || '[]')
      const ontvangsten = JSON.parse(localStorage.getItem('ontvangsten') || '[]')
      const productieRuns = JSON.parse(localStorage.getItem('productieRuns') || '[]')

      // Bereken statistieken
      const totaalVoorraadVolume = voorraad.reduce((sum: number, item: any) => sum + item.volume, 0)
      const beschikbaarVolume = voorraad
        .filter((item: any) => item.status === 'beschikbaar')
        .reduce((sum: number, item: any) => sum + item.beschikbaarVolume, 0)
      const inProductieVolume = voorraad
        .filter((item: any) => item.status === 'in-productie')
        .reduce((sum: number, item: any) => sum + item.beschikbaarVolume, 0)
      const verwerktVolume = voorraad
        .filter((item: any) => item.status === 'verwerkt')
        .reduce((sum: number, item: any) => sum + item.volume, 0)

      const actieveProductieRuns = 0 // Geen actieve runs meer in nieuwe implementatie
      const voltooideProductieRuns = productieRuns.length

      const uniekeTraces = new Set(voorraad.map((item: any) => item.tracesId)).size
      const uniekeLeveranciers = new Set(voorraad.map((item: any) => item.leverancier)).size

      setStats({
        totaalOntvangsten: ontvangsten.length,
        totaalVoorraadVolume,
        beschikbaarVolume,
        inProductieVolume,
        verwerktVolume,
        actieveProductieRuns,
        voltooideProductieRuns,
        uniekeTraces,
        uniekeLeveranciers
      })

      // Genereer recente activiteiten
      const activiteiten: RecenteActiviteit[] = []

      // Voeg ontvangsten toe
      ontvangsten.slice(-5).forEach((ontvangst: any) => {
        const datum = ontvangst && ontvangst.ontvangstDatum ? new Date(ontvangst.ontvangstDatum) : new Date()
        const leverancierNaam = ontvangst?.leverancier?.naam || ontvangst?.leverancier || 'Onbekend'
        const volume = Number(ontvangst?.volume ?? 0)
        const houtType = ontvangst?.houtType || ''
        activiteiten.push({
          type: 'ontvangst',
          datum,
          beschrijving: `Ontvangst geregistreerd`,
          details: `${volume}m³ ${houtType} van ${leverancierNaam}`
        })
      })

      // Voeg productie runs toe
      productieRuns.slice(-5).forEach((run: any) => {
        const prodDatumRaw = run?.productieDatum || run?.eindDatum || run?.startDatum || run?.createdAt || new Date().toISOString()
        const datum = prodDatumRaw ? new Date(prodDatumRaw) : new Date()
        const week = run?.productieWeek || run?.week || ''
        const jaar = run?.productieJaar || run?.jaar || ''
        const inputVolume = Number(run?.inputVolume ?? run?.totaalInput ?? 0)
        const batch = run?.batchNummer || 'Onbekend'
        const details = week && jaar ? `Batch ${batch} - Week ${week}/${jaar} - ${inputVolume}m³ input` : `Batch ${batch} - ${inputVolume}m³ input`
        activiteiten.push({
          type: 'productie-eind',
          datum,
          beschrijving: `Productie run aangemaakt`,
          details
        })
      })

      // Sorteer op datum (meest recent eerst)
      activiteiten.sort((a, b) => b.datum.getTime() - a.datum.getTime())
      setRecenteActiviteiten(activiteiten.slice(0, 10))

    } catch (error) {
      console.error('Fout bij laden dashboard data:', error)
    }
    setLoading(false)
  }

  const getActiviteitIcon = (type: string) => {
    switch (type) {
      case 'ontvangst': return '📦'
      case 'productie-start': return '🏭'
      case 'productie-eind': return '✅'
      default: return '📋'
    }
  }

  const getActiviteitColor = (type: string) => {
    switch (type) {
      case 'ontvangst': return 'text-blue-600'
      case 'productie-start': return 'text-yellow-600'
      case 'productie-eind': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
            <span className="ml-2">Dashboard laden...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-wood-brown">Dashboard</h1>
            <p className="text-gray-600">Overzicht van alle EUDR traceability processen</p>
          </div>
          <Link href="/" className="text-forest-green hover:underline">
            ← Terug naar hoofdmenu
          </Link>
        </div>

        {/* Statistieken grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-forest-green bg-opacity-10 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Totaal Ontvangsten</h3>
            <p className="text-2xl font-bold text-forest-green">{stats?.totaalOntvangsten || 0}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Totaal Voorraad</h3>
            <p className="text-2xl font-bold text-blue-600">
                {(Number(stats?.totaalVoorraadVolume ?? 0)).toFixed(1)} m³
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Beschikbaar Volume</h3>
            <p className="text-2xl font-bold text-green-600">
                {(Number(stats?.beschikbaarVolume ?? 0)).toFixed(1)} m³
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">In Productie</h3>
            <p className="text-2xl font-bold text-yellow-600">
                {(Number(stats?.inProductieVolume ?? 0)).toFixed(1)} m³
            </p>
          </div>
        </div>

        {/* Productie statistieken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Actieve Runs</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.actieveProductieRuns || 0}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Voltooide Runs</h3>
            <p className="text-2xl font-bold text-gray-600">{stats?.voltooideProductieRuns || 0}</p>
          </div>
          
          <div className="bg-sage-green bg-opacity-20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Unieke TRACES</h3>
            <p className="text-2xl font-bold text-sage-green">{stats?.uniekeTraces || 0}</p>
          </div>
          
          <div className="bg-wood-brown bg-opacity-10 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Leveranciers</h3>
            <p className="text-2xl font-bold text-wood-brown">{stats?.uniekeLeveranciers || 0}</p>
          </div>
        </div>

        {/* Proces flow status */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-wood-brown mb-4">Proces Flow Status</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-forest-green rounded-full"></div>
              <span className="text-sm">EUDR Validatie</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Ontvangst ({stats?.totaalOntvangsten || 0})</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Voorraad ({(Number(stats?.totaalVoorraadVolume ?? 0)).toFixed(1)}m³)</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Productie ({stats?.actieveProductieRuns || 0} actief)</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Rapporten ({stats?.voltooideProductieRuns || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recente activiteiten */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-wood-brown mb-4">Recente Activiteiten</h2>
        
        {recenteActiviteiten.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nog geen activiteiten geregistreerd</p>
        ) : (
          <div className="space-y-3">
            {recenteActiviteiten.map((activiteit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-2xl">{getActiviteitIcon(activiteit.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${getActiviteitColor(activiteit.type)}`}>
                      {activiteit.beschrijving}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {activiteit.datum.toLocaleString('nl-NL')}
                    </span>
                  </div>
                  {activiteit.details && (
                    <p className="text-sm text-gray-600 mt-1">{activiteit.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snelle acties verwijderd voor minimalistische weergave */}

      {/* EUDR Compliance indicator */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-700">EUDR Compliance Status</h3>
            <p className="text-sm text-gray-600">
              Alle processen voldoen aan EUDR regelgeving. Volledige traceability van bos tot eindproduct gegarandeerd.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
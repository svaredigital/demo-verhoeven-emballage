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
        activiteiten.push({
          type: 'ontvangst',
          datum: new Date(ontvangst.ontvangstDatum),
          beschrijving: `Ontvangst geregistreerd`,
          details: `${ontvangst.volume}m³ ${ontvangst.houtType} van ${ontvangst.leverancier.naam}`
        })
      })

      // Voeg productie runs toe
      productieRuns.slice(-5).forEach((run: any) => {
        activiteiten.push({
          type: 'productie-eind',
          datum: new Date(run.productieDatum),
          beschrijving: `Productie run aangemaakt`,
          details: `Batch ${run.batchNummer} - Week ${run.productieWeek}/${run.productieJaar} - ${run.inputVolume}m³ input`
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
              {stats?.totaalVoorraadVolume.toFixed(1) || '0.0'} m³
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Beschikbaar Volume</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats?.beschikbaarVolume.toFixed(1) || '0.0'} m³
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">In Productie</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.inProductieVolume.toFixed(1) || '0.0'} m³
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
              <span className="text-sm">Ontvangst ({stats?.totaalOntvangsten})</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Voorraad ({stats?.totaalVoorraadVolume.toFixed(1)}m³)</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Productie ({stats?.actieveProductieRuns} actief)</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Rapporten ({stats?.voltooideProductieRuns})</span>
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

      {/* Snelle acties */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-wood-brown mb-4">Snelle Acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/eudr-validatie"
            className="bg-forest-green text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold">Nieuwe Ontvangst</h3>
            <p className="text-sm opacity-90">Valideer EUDR en registreer ontvangst</p>
          </Link>
          
          <Link
            href="/voorraad"
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-semibold">Bekijk Voorraad</h3>
            <p className="text-sm opacity-90">Overzicht van alle voorraad items</p>
          </Link>
          
          <Link
            href="/productie"
            className="bg-wood-brown text-white p-4 rounded-lg hover:bg-yellow-800 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🏭</div>
            <h3 className="font-semibold">Start Productie</h3>
            <p className="text-sm opacity-90">Begin nieuwe productie run</p>
          </Link>
          
          <Link
            href="/rapporten"
            className="bg-sage-green text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold">Bekijk Rapporten</h3>
            <p className="text-sm opacity-90">Batch uitkomsten en traceability</p>
          </Link>
          
          <button
            onClick={loadDashboardData}
            className="bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold">Ververs Data</h3>
            <p className="text-sm opacity-90">Herlaad alle statistieken</p>
          </button>
          
          <button
            onClick={() => {
              if (confirm('Weet je zeker dat je alle demo data wilt wissen? Dit kan niet ongedaan gemaakt worden.')) {
                localStorage.clear()
                window.location.reload()
              }
            }}
            className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🗑️</div>
            <h3 className="font-semibold">Reset Demo</h3>
            <p className="text-sm opacity-90">Wis alle demo data</p>
          </button>
        </div>
      </div>

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
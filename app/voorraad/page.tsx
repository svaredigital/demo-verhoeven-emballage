"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface VoorraadItem {
  id: string;
  tracesId: string;
  ontvangstId: string;
  houtType: string;
  volume: number;
  beschikbaarVolume: number;
  leverancier: string;
  ontvangstDatum: Date;
  status: 'beschikbaar' | 'in-productie' | 'verwerkt';
}

export default function VoorraadOverzicht() {
  const [voorraad, setVoorraad] = useState<VoorraadItem[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [filterHoutType, setFilterHoutType] = useState<string>('alle')
  const [sortBy, setSortBy] = useState<string>('ontvangstDatum')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Laad voorraad uit localStorage
    const loadVoorraad = () => {
      try {
        const voorraadData = JSON.parse(localStorage.getItem('voorraad') || '[]')
        // Converteer datum strings terug naar Date objecten
        const voorraadMetDates = voorraadData.map((item: any) => ({
          ...item,
          ontvangstDatum: new Date(item.ontvangstDatum)
        }))
        setVoorraad(voorraadMetDates)
      } catch (error) {
        console.error('Fout bij laden voorraad:', error)
        setVoorraad([])
      }
      setLoading(false)
    }

    loadVoorraad()
  }, [])

  // Filter en sorteer voorraad
  // Belangrijk: verwerkte items worden niet in de hoofd-voorraadlijst getoond;
  // die zijn terug te vinden onder "Gerealiseerde Producten" of in rapporten.
  const gefilterdeSorteerdeVoorraad = voorraad
    .filter(item => item.status !== 'verwerkt')
    .filter(item => {
      if (filterStatus !== 'alle' && item.status !== filterStatus) return false
      if (filterHoutType !== 'alle' && item.houtType !== filterHoutType) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'ontvangstDatum':
          return new Date(b.ontvangstDatum).getTime() - new Date(a.ontvangstDatum).getTime()
        case 'volume':
          return b.beschikbaarVolume - a.beschikbaarVolume
        case 'leverancier':
          return a.leverancier.localeCompare(b.leverancier)
        case 'houtType':
          return a.houtType.localeCompare(b.houtType)
        default:
          return 0
      }
    })

  // Statistieken
  const totaalVolume = voorraad.reduce((sum, item) => sum + item.volume, 0)
  const beschikbaarVolume = voorraad.reduce((sum, item) => sum + (item.status === 'beschikbaar' ? item.beschikbaarVolume : 0), 0)
  const inProductieVolume = voorraad.reduce((sum, item) => sum + (item.status === 'in-productie' ? item.beschikbaarVolume : 0), 0)
  const verwerktVolume = voorraad.reduce((sum, item) => sum + (item.status === 'verwerkt' ? item.volume : 0), 0)

  const onverwerktVolume = voorraad.reduce((sum, item) => item.status !== 'verwerkt' ? sum + item.volume : sum, 0)

  const uniekeLeveranciers = Array.from(new Set(voorraad.map(item => item.leverancier)))
  const uniekeHoutTypes = Array.from(new Set(voorraad.map(item => item.houtType)))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beschikbaar': return 'bg-green-100 text-green-800'
      case 'in-productie': return 'bg-yellow-100 text-yellow-800'
      case 'verwerkt': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'beschikbaar': return 'Beschikbaar'
      case 'in-productie': return 'In Productie'
      case 'verwerkt': return 'Verwerkt'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
            <span className="ml-2">Voorraad laden...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-wood-brown">Voorraad Overzicht</h1>
            <p className="text-gray-600">Alle rondhout voorraad met TRACES traceability</p>
          </div>
          <Link href="/" className="text-forest-green hover:underline mt-2 sm:mt-0">
            ← Terug naar hoofdmenu
          </Link>
        </div>

        {/* Statistieken - vereenvoudigd naar 2 kaarten per verzoek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-forest-green bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Totale Onverwerkte Voorraad</h3>
            <p className="text-2xl font-bold text-forest-green mt-2">{onverwerktVolume.toFixed(1)} m³</p>
            <p className="text-sm text-gray-500 mt-1">(items met status niet 'verwerkt')</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Totaal Geproduceerde Voorraad</h3>
            <p className="text-2xl font-bold text-gray-700 mt-2">{verwerktVolume.toFixed(1)} m³</p>
            <p className="text-sm text-gray-500 mt-1">(verwerkte items / geproduceerde output)</p>
          </div>
        </div>

        {/* Filters en sortering */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="alle">Alle (zonder verwerkte)</option>
              <option value="beschikbaar">Beschikbaar</option>
              <option value="in-productie">In Productie</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Houtsoort Filter</label>
            <select
              value={filterHoutType}
              onChange={(e) => setFilterHoutType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="alle">Alle houtsoorten</option>
              {uniekeHoutTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sorteren op</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="ontvangstDatum">Ontvangst Datum</option>
              <option value="volume">Volume</option>
              <option value="leverancier">Leverancier</option>
              <option value="houtType">Houtsoort</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voorraad tabel */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {gefilterdeSorteerdeVoorraad.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen voorraad gevonden</h3>
            <p className="text-gray-500 mb-4">
              {voorraad.length === 0 
                ? 'Er zijn nog geen ontvangsten geregistreerd.' 
                : 'Geen items gevonden met de huidige filters.'}
            </p>
            <Link
              href="/eudr-validatie"
              className="bg-forest-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Nieuwe Ontvangst Registreren
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TRACES / ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leverancier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Houtsoort</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschikbaar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ontvangst Datum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gefilterdeSorteerdeVoorraad.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.tracesId}</div>
                      <div className="text-sm text-gray-500">{item.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.leverancier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.houtType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.volume.toFixed(1)} m³</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.beschikbaarVolume.toFixed(1)} m³</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.ontvangstDatum.toLocaleDateString('nl-NL')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gerealiseerde Producten */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-wood-brown mb-4">Gerealiseerde Producten</h3>
        <p className="text-sm text-gray-600 mb-4">Producten per batch (klik op batch voor trace-overzicht)</p>
        <ProducedBatchesList />
      </div>

      {/* Snelle acties verwijderd voor minimalistische weergave */}
    </div>
  )
}

function ProducedBatchesList() {
  const [runs, setRuns] = useState<Array<any>>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(()=>{
    try{
      const r = JSON.parse(localStorage.getItem('productieRuns') || '[]')
      const withOutput = r.filter((run: any) => Array.isArray(run.outputProducts) && run.outputProducts.length > 0)
      setRuns(withOutput)
    }catch(e){
      setRuns([])
    }
  },[])

  if(runs.length === 0) {
    return <p className="text-gray-500">Nog geen geproduceerde batches gevonden.</p>
  }

  // Group by product name
  const groups: Record<string, Array<{run:any, hoeveelheid:number, eenheid:string, batchNummer:string}>> = {}
  runs.forEach((run:any) => {
    run.outputProducts.forEach((p:any) => {
      if(!groups[p.naam]) groups[p.naam] = []
      groups[p.naam].push({ run, hoeveelheid: p.hoeveelheid, eenheid: p.eenheid || 'st', batchNummer: run.batchNummer })
    })
  })

  const toggle = (name:string) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }))

  return (
    <div className="space-y-4">
      {Object.keys(groups).map((naam) => {
        const items = groups[naam]
        const totaal = items.reduce((s, it) => s + Number(it.hoeveelheid || 0), 0)
        return (
          <div key={naam} className="bg-gray-50 rounded p-3">
            <button onClick={()=>toggle(naam)} className="w-full text-left flex items-center justify-between">
              <div>
                <div className="font-semibold text-wood-brown">{naam}</div>
                <div className="text-sm text-gray-600">Totaal: {totaal} {items[0].eenheid}</div>
              </div>
              <div className="text-sm text-gray-500">{items.length} batches ▾</div>
            </button>

            {expanded[naam] && (
              <div className="mt-3 space-y-2">
                {items.slice().reverse().map((it, idx) => (
                  <div key={idx} className="p-2 bg-white rounded flex items-center justify-between">
                    <div>
                      <Link href={`/voorraad/batch/${encodeURIComponent(it.batchNummer)}`} className="text-forest-green font-medium">{it.batchNummer}</Link>
                      <div className="text-xs text-gray-500">{new Date(it.run.productieDatum).toLocaleDateString('nl-NL')}</div>
                    </div>
                    <div className="text-sm text-gray-700">{it.hoeveelheid} {it.eenheid}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
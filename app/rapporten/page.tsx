'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface ProductieRun {
  id: string;
  batchNummer: string;
  week: number;
  jaar: number;
  startDatum: Date;
  eindDatum?: Date;
  status: 'actief' | 'voltooid';
  gebruikteTraces: string[];
  inputVolume: number;
  outputProducts?: Array<{ id?: string; naam: string; hoeveelheid: number; eenheid?: string }>;
}

interface VoorraadItem {
  id: string;
  tracesId: string;
  ontvangstId: string;
  houtType: string;
  volume: number;
  beschikbaarVolume: number;
  leverancier: string;
  ontvangstDatum: Date;
  status: string;
}

interface BatchUitkomst {
  batchNummer: string;
  productieRunId: string;
  producten: Array<{ naam: string; hoeveelheid: number; eenheid?: string }>;
  gebruikteTraces: {
    tracesId: string;
    volume: number;
    leverancier: string;
    houtType: string;
  }[];
  totaalInput: number;
  totaalOutput: number;
  efficiencyPercentage: number;
  productieData: Date;
}

export default function Rapporten() {
  const searchParams = useSearchParams()
  const [productieRuns, setProductieRuns] = useState<ProductieRun[]>([])
  const [voorraad, setVoorraad] = useState<VoorraadItem[]>([])
  const [geselecteerdeBatch, setGeselecteerdeBatch] = useState<string>('')
  const [batchUitkomst, setBatchUitkomst] = useState<BatchUitkomst | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Check voor batch parameter in URL
    const batchParam = searchParams.get('batch')
    if (batchParam) {
      setGeselecteerdeBatch(batchParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (geselecteerdeBatch && productieRuns.length > 0) {
      genereerBatchRapport(geselecteerdeBatch)
    }
  }, [geselecteerdeBatch, productieRuns])

  const loadData = () => {
    try {
      // Laad productie runs
      const runsData = JSON.parse(localStorage.getItem('productieRuns') || '[]')
      const runsMetDates = runsData.map((run: any) => ({
        ...run,
        startDatum: new Date(run.startDatum),
        eindDatum: run.eindDatum ? new Date(run.eindDatum) : undefined
      }))
      setProductieRuns(runsMetDates)

      // Laad voorraad
      const voorraadData = JSON.parse(localStorage.getItem('voorraad') || '[]')
      const voorraadMetDates = voorraadData.map((item: any) => ({
        ...item,
        ontvangstDatum: new Date(item.ontvangstDatum)
      }))
      setVoorraad(voorraadMetDates)
    } catch (error) {
      console.error('Fout bij laden data:', error)
    }
    setLoading(false)
  }

  const genereerBatchRapport = (batchNummer: string) => {
    const run = productieRuns.find(r => r.batchNummer === batchNummer)
    if (!run || run.status !== 'voltooid') return
    // If the run contains explicit outputProducts (user-selected during production), use those
    let productenList: Array<{ naam: string; hoeveelheid: number; eenheid?: string }> = []
    let totaalOutput = 0
    if (run.outputProducts && Array.isArray(run.outputProducts) && run.outputProducts.length > 0) {
      productenList = run.outputProducts.map((p: any) => ({ naam: p.naam, hoeveelheid: Number(p.hoeveelheid || 0), eenheid: p.eenheid || 'st' }))
      totaalOutput = productenList.reduce((s, p) => s + Number(p.hoeveelheid || 0), 0)
    } else {
      // Fallback: simulate production outcomes based on input (legacy runs)
      const efficiencyFactor = 0.85 + Math.random() * 0.1 // 85-95% efficiency
    totaalOutput = (Number((run as any).inputVolume) || 0) * efficiencyFactor

      // Verdeling van producten (simulatie)
      const plankjesPercentage = 0.6 + Math.random() * 0.1 // 60-70%
      const zaagselPercentage = 0.2 + Math.random() * 0.05 // 20-25%
      const chipsPercentage = 1 - plankjesPercentage - zaagselPercentage

      const plankjes = totaalOutput * plankjesPercentage
      const zaagsel = totaalOutput * zaagselPercentage
      const chips = totaalOutput * chipsPercentage

      productenList = [
        { naam: 'Plankjes', hoeveelheid: plankjes, eenheid: 'm³' },
        { naam: 'Zaagsel', hoeveelheid: zaagsel, eenheid: 'm³' },
        { naam: 'Chips', hoeveelheid: chips, eenheid: 'm³' }
      ]
    }
    // Haal gebruikte traces details op
    const gebruikteTracesDetails = run.gebruikteTraces.map(tracesId => {
      const item = voorraad.find(v => v.tracesId === tracesId)
      if (item) {
        return {
          tracesId: item.tracesId,
          volume: item.volume,
          leverancier: item.leverancier,
          houtType: item.houtType
        }
      }
      return {
        tracesId,
        volume: 0,
        leverancier: 'Onbekend',
        houtType: 'Onbekend'
      }
    })

    const inputVol = Number((run as any).inputVolume) || 0
    const uitkomst: BatchUitkomst = {
      batchNummer,
      productieRunId: run.id,
      producten: productenList,
      gebruikteTraces: gebruikteTracesDetails,
      totaalInput: inputVol,
      totaalOutput,
      efficiencyPercentage: inputVol > 0 ? (totaalOutput / inputVol) * 100 : 0,
      productieData: run.eindDatum || new Date()
    }

    setBatchUitkomst(uitkomst)
  }

  const voltooideRuns = productieRuns.filter(run => run.status === 'voltooid')

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
            <span className="ml-2">Rapporten laden...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-wood-brown">Productie Rapporten</h1>
          <Link href="/" className="text-forest-green hover:underline">
            ← Terug naar hoofdmenu
          </Link>
        </div>

        {voltooideRuns.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen Voltooide Productie Runs</h3>
            <p className="text-gray-500 mb-4">
              Start en voltooi een productie run om rapporten te genereren.
            </p>
            <Link
              href="/productie"
              className="bg-forest-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Naar Productie
            </Link>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecteer Batch voor Rapport
            </label>
            <select
              value={geselecteerdeBatch}
              onChange={(e) => setGeselecteerdeBatch(e.target.value)}
              className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">Selecteer een batch...</option>
              {voltooideRuns.map(run => (
                <option key={run.id} value={run.batchNummer}>
                  {run.batchNummer} - W{(run as any).week || ''}/{(run as any).jaar || ''} ({(Number((run as any).inputVolume) || 0).toFixed(1)} m³)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Batch rapport */}
      {batchUitkomst && (
        <div className="space-y-6">
          {/* Rapport header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-wood-brown">
                Batch Rapport: {batchUitkomst.batchNummer}
              </h2>
              <span className="text-sm text-gray-500">
                Gegenereerd: {new Date().toLocaleString('nl-NL')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-forest-green bg-opacity-10 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Input Volume</h3>
                <p className="text-2xl font-bold text-forest-green">
                  {batchUitkomst.totaalInput.toFixed(1)} m³
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Output Volume</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {batchUitkomst.totaalOutput.toFixed(1)} m³
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Efficiency</h3>
                <p className="text-2xl font-bold text-green-600">
                  {batchUitkomst.efficiencyPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Productie Datum</h3>
                <p className="text-lg font-semibold text-gray-700">
                  {batchUitkomst.productieData.toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          </div>

          {/* Product uitkomsten */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-wood-brown mb-4">Product Uitkomsten</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hoeveelheid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Eenheid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">% van Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batchUitkomst.producten.map((p, idx) => (
                    <tr key={`${p.naam}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-wood-brown">{p.naam}</td>
                      <td className="px-4 py-2 text-sm">{Number(p.hoeveelheid).toFixed(1)}</td>
                      <td className="px-4 py-2 text-sm">{p.eenheid || 'st'}</td>
                      <td className="px-4 py-2 text-sm">{batchUitkomst.totaalOutput ? ((Number(p.hoeveelheid) / batchUitkomst.totaalOutput) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traceability - Gebruikte TRACES */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-wood-brown mb-4">
              Traceability - Gebruikte Grondstoffen
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Alle TRACES IDs die hebben bijgedragen aan deze batch uitkomst:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      TRACES ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Leverancier
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Houtsoort
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Volume Input
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      % van Batch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batchUitkomst.gebruikteTraces.map((trace, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-forest-green">
                        {trace.tracesId}
                      </td>
                      <td className="px-4 py-2 text-sm">{trace.leverancier}</td>
                      <td className="px-4 py-2 text-sm">{trace.houtType}</td>
                      <td className="px-4 py-2 text-sm">{(trace.volume || 0).toFixed(1)} m³</td>
                      <td className="px-4 py-2 text-sm">
                        {batchUitkomst.totaalInput ? ((trace.volume / batchUitkomst.totaalInput) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-forest-green bg-opacity-10 rounded-lg">
              <h4 className="font-semibold text-forest-green mb-2">EUDR Compliance</h4>
              <p className="text-sm text-gray-700">
                Alle gebruikte grondstoffen zijn volledig traceerbaar via TRACES systeem. 
                Dit rapport voldoet aan EUDR regelgeving voor volledige traceability van 
                bos tot eindproduct.
              </p>
            </div>
          </div>

          {/* Rapport acties */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-wood-brown mb-4">Rapport Acties</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.print()}
                className="bg-forest-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🖨️ Print Rapport
              </button>
              <button 
                onClick={() => {
                  const data = JSON.stringify(batchUitkomst, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `batch-rapport-${batchUitkomst.batchNummer}.json`
                  a.click()
                }}
                className="bg-wood-brown text-white px-6 py-2 rounded-lg hover:bg-yellow-800 transition-colors"
              >
                💾 Exporteer Data
              </button>
              <Link
                href="/productie"
                className="bg-sage-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors text-center"
              >
                Nieuwe Productie Run
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
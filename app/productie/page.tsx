'use client'
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

interface ProductieRun {
  id: string;
  batchNummer: string;
  productieWeek: number;
  productieJaar: number;
  productieDatum: Date;
  status: 'voltooid' | 'concept';
  gebruikteTraces: string[];
  inputVolume: number;
  customOutput?: string;
}

interface LeveringVoorProductie {
  tracesId: string;
  leverancier: string;
  houtType: string;
  volume: number;
  ontvangstDatum: Date;
  geselecteerd: boolean;
}

export default function ProductieRun() {
  const [voorraad, setVoorraad] = useState<VoorraadItem[]>([])
  const [bestaandeRuns, setBestaandeRuns] = useState<ProductieRun[]>([])
  const [geselecteerdeWeek, setGeselecteerdeWeek] = useState<number>(0)
  const [geselecteerdeJaar, setGeselecteerdeJaar] = useState<number>(0)
  const [leveringenVoorWeek, setLeveringenVoorWeek] = useState<LeveringVoorProductie[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customOutput, setCustomOutput] = useState('')
  const [showCustomOutput, setShowCustomOutput] = useState(false)
  const [toonAlleLeveringen, setToonAlleLeveringen] = useState(false)

  useEffect(() => {
    loadData()
    // Stel huidige week en jaar in als default
    const nu = new Date()
    const week = getWeekNumber(nu)
    const jaar = nu.getFullYear()
    setGeselecteerdeWeek(week)
    setGeselecteerdeJaar(jaar)
  }, [])

  useEffect(() => {
    if ((geselecteerdeWeek && geselecteerdeJaar && voorraad.length > 0) || (toonAlleLeveringen && voorraad.length > 0)) {
      laadLeveringenVoorWeek(geselecteerdeWeek, geselecteerdeJaar)
    }
  }, [geselecteerdeWeek, geselecteerdeJaar, voorraad, toonAlleLeveringen])

  const loadData = () => {
    try {
      // Laad voorraad
      const voorraadData = JSON.parse(localStorage.getItem('voorraad') || '[]')
      const voorraadMetDates = voorraadData.map((item: any) => ({
        ...item,
        ontvangstDatum: new Date(item.ontvangstDatum)
      }))
      setVoorraad(voorraadMetDates)

      // Laad productie runs
      const runsData = JSON.parse(localStorage.getItem('productieRuns') || '[]')
      const runsMetDates = runsData.map((run: any) => ({
        ...run,
        productieDatum: new Date(run.productieDatum)
      }))
      setBestaandeRuns(runsMetDates)
    } catch (error) {
      console.error('Fout bij laden data:', error)
    }
    setLoading(false)
  }

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.ceil(diff / oneWeek)
  }

  const getWeekDateRange = (week: number, year: number) => {
    const start = new Date(year, 0, 1)
    const startWeek = new Date(start.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
    const endWeek = new Date(startWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    return { start: startWeek, end: endWeek }
  }

  const laadLeveringenVoorWeek = (week: number, jaar: number) => {
    if (toonAlleLeveringen) {
      // Toon alle beschikbare leveringen ongeacht de week
      const alleLeveringen = voorraad.filter(item => item.status === 'beschikbaar')
      
      const leveringen: LeveringVoorProductie[] = alleLeveringen.map(item => ({
        tracesId: item.tracesId,
        leverancier: item.leverancier,
        houtType: item.houtType,
        volume: item.volume,
        ontvangstDatum: item.ontvangstDatum,
        geselecteerd: false
      }))

      setLeveringenVoorWeek(leveringen)
      return
    }

    const { start, end } = getWeekDateRange(week, jaar)
    
    // Check of er al een productie run is voor deze week
    const bestaandeRun = bestaandeRuns.find(run => 
      run.productieWeek === week && run.productieJaar === jaar
    )
    
    // Filter voorraad items die in deze week zijn ontvangen
    const leveringenInWeek = voorraad.filter(item => {
      const ontvangstDatum = new Date(item.ontvangstDatum)
      return ontvangstDatum >= start && 
             ontvangstDatum <= end && 
             item.status === 'beschikbaar'
    })

    // Converteer naar LeveringVoorProductie format
    const leveringen: LeveringVoorProductie[] = leveringenInWeek.map(item => ({
      tracesId: item.tracesId,
      leverancier: item.leverancier,
      houtType: item.houtType,
      volume: item.volume,
      ontvangstDatum: item.ontvangstDatum,
      geselecteerd: !bestaandeRun // Automatisch selecteren als nog geen run bestaat
    }))

    setLeveringenVoorWeek(leveringen)
  }

  const toggleLevering = (tracesId: string) => {
    setLeveringenVoorWeek(prev => 
      prev.map(levering => 
        levering.tracesId === tracesId 
          ? { ...levering, geselecteerd: !levering.geselecteerd }
          : levering
      )
    )
  }

  const generateBatchNumber = (week: number, year: number) => {
    return `BATCH-${year}-W${week.toString().padStart(2, '0')}`
  }

  const aanvullenProductieRun = (run: ProductieRun) => {
    const output = prompt('Voeg output informatie toe voor deze productie run:', run.customOutput || '')
    if (output !== null) {
      const updatedRuns = bestaandeRuns.map(r => 
        r.id === run.id 
          ? { ...r, customOutput: output, status: 'voltooid' as const }
          : r
      )
      setBestaandeRuns(updatedRuns)
      localStorage.setItem('productieRuns', JSON.stringify(updatedRuns))
      alert('Productie run aangepast!')
    }
  }

  const maakProductieRun = async () => {
    if (!geselecteerdeWeek || !geselecteerdeJaar) {
      alert('Selecteer een week en jaar')
      return
    }

    const geselecteerdeLeveringen = leveringenVoorWeek.filter(l => l.geselecteerd)
    if (geselecteerdeLeveringen.length === 0) {
      alert('Selecteer minimaal één levering voor de productie run')
      return
    }

    // Check of er al een run bestaat voor deze week
    const bestaandeRun = bestaandeRuns.find(run => 
      run.productieWeek === geselecteerdeWeek && 
      run.productieJaar === geselecteerdeJaar
    )
    
    if (bestaandeRun) {
      alert(`Er bestaat al een productie run voor week ${geselecteerdeWeek}/${geselecteerdeJaar}`)
      return
    }

    setIsSubmitting(true)

    try {
      const batchNummer = generateBatchNumber(geselecteerdeWeek, geselecteerdeJaar)
      const totaalVolume = geselecteerdeLeveringen.reduce((sum, l) => sum + l.volume, 0)

      const nieuweRun: ProductieRun = {
        id: `RUN-${Date.now()}`,
        batchNummer,
        productieWeek: geselecteerdeWeek,
        productieJaar: geselecteerdeJaar,
        productieDatum: new Date(),
        status: customOutput ? 'voltooid' : 'concept',
        gebruikteTraces: geselecteerdeLeveringen.map(l => l.tracesId),
        inputVolume: totaalVolume,
        customOutput: customOutput || undefined
      }

      // Update voorraad status naar verwerkt
      const updatedVoorraad = voorraad.map(item => {
        if (geselecteerdeLeveringen.some(l => l.tracesId === item.tracesId)) {
          return { ...item, status: 'verwerkt' as const }
        }
        return item
      })
      setVoorraad(updatedVoorraad)
      localStorage.setItem('voorraad', JSON.stringify(updatedVoorraad))

      // Sla productie run op
      const updatedRuns = [...bestaandeRuns, nieuweRun]
      setBestaandeRuns(updatedRuns)
      localStorage.setItem('productieRuns', JSON.stringify(updatedRuns))

      // Reset leveringen
      setLeveringenVoorWeek([])
      
      alert(`Productie run ${batchNummer} succesvol aangemaakt!`)
    } catch (error) {
      console.error('Fout bij aanmaken productie run:', error)
      alert('Er is een fout opgetreden bij het aanmaken van de productie run')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Genereer week opties (huidige week + 10 weken terug en vooruit)
  const generateWeekOptions = () => {
    const options = []
    const huidigeDatum = new Date()
    const huidigeWeek = getWeekNumber(huidigeDatum)
    const huidigJaar = huidigeDatum.getFullYear()
    
    for (let i = -10; i <= 2; i++) {
      let week = huidigeWeek + i
      let jaar = huidigJaar
      
      if (week <= 0) {
        week = 52 + week
        jaar = huidigJaar - 1
      } else if (week > 52) {
        week = week - 52
        jaar = huidigJaar + 1
      }
      
      const { start, end } = getWeekDateRange(week, jaar)
      options.push({
        week,
        jaar,
        label: `Week ${week} / ${jaar}`,
        dateRange: `${start.toLocaleDateString('nl-NL')} - ${end.toLocaleDateString('nl-NL')}`
      })
    }
    
    return options
  }

  const weekOpties = generateWeekOptions()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
            <span className="ml-2">Productie data laden...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-wood-brown">Wekelijkse Productie Runs</h1>
          <Link href="/" className="text-forest-green hover:underline">
            ← Terug naar hoofdmenu
          </Link>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Hoe het werkt:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Selecteer de productieweek (meestal vorige week)</li>
            <li>2. Alle leveringen van die week worden automatisch geselecteerd</li>
            <li>3. Zet eventueel vrachten uit die niet meedoen</li>
            <li>4. Maak de productie run aan voor rapportage</li>
          </ol>
        </div>

        {/* Week selectie */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={toonAlleLeveringen}
                onChange={(e) => {
                  setToonAlleLeveringen(e.target.checked)
                  if (geselecteerdeWeek && geselecteerdeJaar) {
                    laadLeveringenVoorWeek(geselecteerdeWeek, geselecteerdeJaar)
                  }
                }}
                className="mr-2 h-4 w-4 text-forest-green focus:ring-forest-green border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Toon alle beschikbare leveringen (ook van vorige weken)
              </span>
            </label>
          </div>
          
          {!toonAlleLeveringen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer Productie Week
              </label>
              <select
                value={`${geselecteerdeWeek}-${geselecteerdeJaar}`}
                onChange={(e) => {
                  const [week, jaar] = e.target.value.split('-').map(Number)
                  setGeselecteerdeWeek(week)
                  setGeselecteerdeJaar(jaar)
                }}
                className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
              >
                {weekOpties.map(optie => (
                  <option key={`${optie.week}-${optie.jaar}`} value={`${optie.week}-${optie.jaar}`}>
                    {optie.label} ({optie.dateRange})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leveringen voor geselecteerde week */}
      {((geselecteerdeWeek && geselecteerdeJaar) || toonAlleLeveringen) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-wood-brown mb-4">
            {toonAlleLeveringen 
              ? 'Alle Beschikbare Leveringen'
              : `Leveringen in Week ${geselecteerdeWeek}/${geselecteerdeJaar}`
            }
          </h2>

          {leveringenVoorWeek.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen Leveringen</h3>
              <p className="text-gray-500">
                Er zijn geen beschikbare leveringen gevonden in week {geselecteerdeWeek}/{geselecteerdeJaar}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-forest-green bg-opacity-10 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Gevonden:</strong> {leveringenVoorWeek.length} leveringen | 
                  <strong> Totaal volume:</strong> {leveringenVoorWeek.reduce((sum, l) => sum + l.volume, 0).toFixed(1)} m³ |
                  <strong> Geselecteerd:</strong> {leveringenVoorWeek.filter(l => l.geselecteerd).length} leveringen ({leveringenVoorWeek.filter(l => l.geselecteerd).reduce((sum, l) => sum + l.volume, 0).toFixed(1)} m³)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selecteren</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TRACES ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Leverancier</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Houtsoort</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ontvangst</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leveringenVoorWeek.map((levering) => (
                      <tr key={levering.tracesId} className={levering.geselecteerd ? 'bg-green-50' : 'bg-white'}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={levering.geselecteerd}
                            onChange={() => toggleLevering(levering.tracesId)}
                            className="w-4 h-4 text-forest-green border-gray-300 rounded focus:ring-forest-green"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-forest-green">
                          {levering.tracesId}
                        </td>
                        <td className="px-4 py-2 text-sm">{levering.leverancier}</td>
                        <td className="px-4 py-2 text-sm">{levering.houtType}</td>
                        <td className="px-4 py-2 text-sm">{levering.volume.toFixed(1)} m³</td>
                        <td className="px-4 py-2 text-sm">
                          {levering.ontvangstDatum.toLocaleDateString('nl-NL')}
                          {toonAlleLeveringen && (
                            <div className="text-xs text-gray-500">
                              W{getWeekNumber(levering.ontvangstDatum)}/{levering.ontvangstDatum.getFullYear()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Custom Output Sectie */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-wood-brown">Productie Output</h3>
                  <button
                    onClick={() => setShowCustomOutput(!showCustomOutput)}
                    className="text-forest-green hover:underline text-sm"
                  >
                    {showCustomOutput ? 'Verberg' : 'Aangepaste output maken'}
                  </button>
                </div>
                
                {showCustomOutput && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Beschrijf het eindproduct van deze productie run:
                    </label>
                    <textarea
                      value={customOutput}
                      onChange={(e) => setCustomOutput(e.target.value)}
                      placeholder="Bijv: 500 m³ pellets klasse A1, 300 m³ zaagsel voor briketten, 150 m³ houtkrullen verpakkingsmateriaal"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Deze informatie wordt opgenomen in het batch rapport en traceerbaarheidsoverzicht.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="space-x-2">
                  <button
                    onClick={() => setLeveringenVoorWeek(prev => prev.map(l => ({ ...l, geselecteerd: true })))}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Alles Selecteren
                  </button>
                  <button
                    onClick={() => setLeveringenVoorWeek(prev => prev.map(l => ({ ...l, geselecteerd: false })))}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  >
                    Alles Deselecteren
                  </button>
                </div>
                
                <button
                  onClick={maakProductieRun}
                  disabled={isSubmitting || leveringenVoorWeek.filter(l => l.geselecteerd).length === 0}
                  className="px-6 py-3 bg-forest-green text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Productie Run Aanmaken...
                    </div>
                  ) : (
                    `Maak Productie Run (${generateBatchNumber(geselecteerdeWeek, geselecteerdeJaar)})`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bestaande productie runs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-wood-brown mb-4">Bestaande Productie Runs</h2>
        
        {bestaandeRuns.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nog geen productie runs aangemaakt</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch Nummer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Week/Jaar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Input Volume</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aantal TRACES</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aangemaakt</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bestaandeRuns.slice().reverse().map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-2 text-sm font-medium">{run.batchNummer}</td>
                    <td className="px-4 py-2 text-sm">W{run.productieWeek}/{run.productieJaar}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        run.status === 'voltooid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {run.status === 'voltooid' ? 'Voltooid' : 'Concept'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{run.inputVolume.toFixed(1)} m³</td>
                    <td className="px-4 py-2 text-sm">{run.gebruikteTraces.length}</td>
                    <td className="px-4 py-2 text-sm">{run.productieDatum.toLocaleDateString('nl-NL')}</td>
                    <td className="px-4 py-2 text-sm space-x-2">
                      <Link
                        href={`/rapporten?batch=${run.batchNummer}`}
                        className="text-forest-green hover:underline"
                      >
                        Rapport
                      </Link>
                      {run.status !== 'voltooid' && (
                        <button
                          onClick={() => aanvullenProductieRun(run)}
                          className="text-blue-600 hover:underline"
                        >
                          Aanvullen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


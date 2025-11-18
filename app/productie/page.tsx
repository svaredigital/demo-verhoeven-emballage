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
  outputProducts?: Array<{
    id: string;
    naam: string;
    hoeveelheid: number;
    eenheid: string;
  }>;
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
  const [outputProducts, setOutputProducts] = useState<Array<{id:string, naam:string, hoeveelheid:number, eenheid:string}>>([])
  const [newOutputNaam, setNewOutputNaam] = useState('')
  const [newOutputHoeveelheid, setNewOutputHoeveelheid] = useState<number | ''>('')
  const [newOutputEenheid, setNewOutputEenheid] = useState('st')
  

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
    if (voorraad.length > 0) {
      laadLeveringenVoorWeek(geselecteerdeWeek, geselecteerdeJaar)
    }
  }, [geselecteerdeWeek, geselecteerdeJaar, voorraad])

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
    // Altijd alle onverwerkte (beschikbare) vrachten tonen, ongeacht week
    const alleLeveringen = voorraad.filter(item => item.status === 'beschikbaar')
    const leveringen: LeveringVoorProductie[] = alleLeveringen.map(item => ({
      tracesId: item.tracesId,
      leverancier: item.leverancier,
      houtType: item.houtType,
      volume: item.volume,
      ontvangstDatum: item.ontvangstDatum,
      geselecteerd: true
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
        customOutput: customOutput || undefined,
        outputProducts: outputProducts.length ? outputProducts : undefined
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

      // Sla geproduceerde producten op in aparte opslag met batch referentie
      try {
        const bestaandeProducten = JSON.parse(localStorage.getItem('producten') || '[]')
        const productenToAdd = (outputProducts || []).map(p => ({
          id: p.id,
          naam: p.naam,
          hoeveelheid: p.hoeveelheid,
          eenheid: p.eenheid,
          batchNummer,
          productieDatum: nieuweRun.productieDatum
        }))
        const updatedProducten = [...bestaandeProducten, ...productenToAdd]
        localStorage.setItem('producten', JSON.stringify(updatedProducten))
      } catch (err) {
        console.error('Fout bij opslaan geproduceerde producten:', err)
      }

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

  // New: save draft (tussentijds opslaan) without updating voorraad or geproduceerde producten
  const saveDraft = () => {
    if (!geselecteerdeWeek || !geselecteerdeJaar) {
      alert('Selecteer een week en jaar')
      return
    }

    const geselecteerdeLeveringen = leveringenVoorWeek.filter(l => l.geselecteerd)
    if (geselecteerdeLeveringen.length === 0) {
      alert('Selecteer minimaal één levering om op te slaan als concept')
      return
    }

    const batchNummer = generateBatchNumber(geselecteerdeWeek, geselecteerdeJaar)
    const totaalVolume = geselecteerdeLeveringen.reduce((sum, l) => sum + l.volume, 0)

    const conceptRun: ProductieRun = {
      id: `RUN-${Date.now()}`,
      batchNummer,
      productieWeek: geselecteerdeWeek,
      productieJaar: geselecteerdeJaar,
      productieDatum: new Date(),
      status: 'concept',
      gebruikteTraces: geselecteerdeLeveringen.map(l => l.tracesId),
      inputVolume: totaalVolume,
      outputProducts: outputProducts.length ? outputProducts : undefined
    }

    const updatedRuns = [...bestaandeRuns, conceptRun]
    setBestaandeRuns(updatedRuns)
    localStorage.setItem('productieRuns', JSON.stringify(updatedRuns))
    alert(`Concept opgeslagen: ${batchNummer}`)
  }

  // Finalize production: perform voorraad updates and save geproduceerde producten
  const finalizeProduction = async () => {
    if (!geselecteerdeWeek || !geselecteerdeJaar) {
      alert('Selecteer een week en jaar')
      return
    }

    const geselecteerdeLeveringen = leveringenVoorWeek.filter(l => l.geselecteerd)
    if (geselecteerdeLeveringen.length === 0) {
      alert('Selecteer minimaal één levering om definitief te produceren')
      return
    }

    // Prevent duplicate final runs for same week/year
    const bestaandeRun = bestaandeRuns.find(run => 
      run.productieWeek === geselecteerdeWeek && 
      run.productieJaar === geselecteerdeJaar && run.status === 'voltooid'
    )
    if (bestaandeRun) {
      alert(`Er bestaat al een definitieve productie run voor week ${geselecteerdeWeek}/${geselecteerdeJaar}`)
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
        status: 'voltooid',
        gebruikteTraces: geselecteerdeLeveringen.map(l => l.tracesId),
        inputVolume: totaalVolume,
        outputProducts: outputProducts.length ? outputProducts : undefined
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

      // Sla geproduceerde producten op in aparte opslag met batch referentie
      try {
        const bestaandeProducten = JSON.parse(localStorage.getItem('producten') || '[]')
        const productenToAdd = (outputProducts || []).map(p => ({
          id: p.id,
          naam: p.naam,
          hoeveelheid: p.hoeveelheid,
          eenheid: p.eenheid,
          batchNummer,
          productieDatum: nieuweRun.productieDatum
        }))
        const updatedProducten = [...bestaandeProducten, ...productenToAdd]
        localStorage.setItem('producten', JSON.stringify(updatedProducten))
      } catch (err) {
        console.error('Fout bij opslaan geproduceerde producten:', err)
      }

      // Reset leveringen
      setLeveringenVoorWeek([])
      setOutputProducts([])
      alert(`Productie run ${batchNummer} is definitief geproduceerd`)
    } catch (error) {
      console.error('Fout bij finaliseren productie:', error)
      alert('Er is een fout opgetreden tijdens finaliseren')
    } finally {
      setIsSubmitting(false)
    }
  }


  const addOutputProduct = () => {
    if (!newOutputNaam || !newOutputHoeveelheid) return
    const p = {
      id: `P-${Date.now()}`,
      naam: newOutputNaam,
      hoeveelheid: Number(newOutputHoeveelheid),
      eenheid: newOutputEenheid
    }
    setOutputProducts(prev => [...prev, p])
    setNewOutputNaam('')
    setNewOutputHoeveelheid('')
    setNewOutputEenheid('st')
  }

  const removeOutputProduct = (id: string) => {
    setOutputProducts(prev => prev.filter(p => p.id !== id))
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecteer Productie Week</label>
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
        </div>
      </div>

      {/* Vereenvoudigde productie UI: 3 secties */}
      {(geselecteerdeWeek && geselecteerdeJaar) && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-wood-brown">Productie Week {geselecteerdeWeek}/{geselecteerdeJaar}</h2>
            <Link href="#history" className="px-3 py-2 bg-gray-100 rounded text-sm hover:underline">Bekijk geschiedenis</Link>
          </div>

          {/* 1. Grondstoffen zonder batch */}
          <div>
            <h3 className="text-lg font-semibold text-wood-brown mb-2">1. Grondstoffen zonder batch</h3>
            <p className="text-sm text-gray-600 mb-3">Onverwerkte vrachten beschikbaar voor productie</p>

            {leveringenVoorWeek.length === 0 ? (
              <div className="text-center py-6 text-gray-500">Geen onverwerkte vrachten gevonden voor deze selectie.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Select</th>
                      <th className="px-3 py-2 text-left">TRACES</th>
                      <th className="px-3 py-2 text-left">Leverancier</th>
                      <th className="px-3 py-2 text-left">Houtsoort</th>
                      <th className="px-3 py-2 text-left">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leveringenVoorWeek.map(l => (
                      <tr key={l.tracesId} className={l.geselecteerd ? 'bg-green-50' : ''}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={l.geselecteerd} onChange={() => toggleLevering(l.tracesId)} className="w-4 h-4" />
                        </td>
                        <td className="px-3 py-2 font-medium text-forest-green">{l.tracesId}</td>
                        <td className="px-3 py-2">{l.leverancier}</td>
                        <td className="px-3 py-2">{l.houtType}</td>
                        <td className="px-3 py-2">{l.volume.toFixed(1)} m³</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Verwerkte artikelen */}
          <div>
            <h3 className="text-lg font-semibold text-wood-brown mb-2">2. Verwerkte artikelen</h3>
            <p className="text-sm text-gray-600 mb-3">Artikel — Eenheid — Aantal</p>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <input value={newOutputNaam} onChange={(e)=>setNewOutputNaam(e.target.value)} placeholder="Artikel (bijv. Pallet)" className="p-2 border rounded w-full" />
              <input value={newOutputHoeveelheid as any} onChange={(e)=>setNewOutputHoeveelheid(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Aantal" className="p-2 border rounded w-full" />
              <select value={newOutputEenheid} onChange={(e)=>setNewOutputEenheid(e.target.value)} className="p-2 border rounded w-full">
                <option value="m3">m³</option>
                <option value="kg">kg</option>
                <option value="st">st</option>
              </select>
              <div className="w-full">
                <button onClick={addOutputProduct} className="w-full px-3 py-2 bg-forest-green text-white rounded">Voeg toe</button>
              </div>
            </div>

            {outputProducts.length === 0 ? (
              <div className="text-gray-500">Nog geen verwerkte artikelen toegevoegd.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Artikel</th>
                      <th className="px-3 py-2 text-left">Eenheid</th>
                      <th className="px-3 py-2 text-left">Aantal</th>
                      <th className="px-3 py-2 text-left">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {outputProducts.map(p => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{p.naam}</td>
                        <td className="px-3 py-2">{p.eenheid}</td>
                        <td className="px-3 py-2">{p.hoeveelheid}</td>
                        <td className="px-3 py-2"><button onClick={()=>removeOutputProduct(p.id)} className="text-red-500 text-sm">Verwijder</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Buttons */}
          <div className="flex gap-4">
            <button onClick={saveDraft} disabled={leveringenVoorWeek.filter(l => l.geselecteerd).length === 0} className="flex-1 px-6 py-4 bg-gray-200 rounded text-lg font-semibold">Tussentijds Opslaan</button>
            <button onClick={finalizeProduction} disabled={isSubmitting || leveringenVoorWeek.filter(l => l.geselecteerd).length === 0} className="flex-1 px-6 py-4 bg-forest-green text-white rounded text-lg font-semibold">Definitief Produceren</button>
          </div>
        </div>
      )}

      {/* Bestaande productie runs */}
      <div id="history" className="bg-white rounded-lg shadow-lg p-6">
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
                  {/* Acties kolom verwijderd voor minimalistische weergave */}
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
                    <td className="px-4 py-2 text-sm">&nbsp;</td>
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


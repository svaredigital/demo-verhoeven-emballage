'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Ontvangst {
  id: string;
  eudrNumber: string;
  tracesId: string;
  leverancier: {
    naam: string;
    adres: string;
    land: string;
  };
  cmrNumber: string;
  pefcNumber: string;
  houtType: string;
  volume: number;
  steresOpCmr?: number;
  ontvangstDatum: Date;
  chauffeurNaam: string;
}

export default function OntvangstRegistratie() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    eudrNumber: '',
    tracesId: '',
    chauffeurNaam: '',
    leverancierNaam: '',
    leverancierAdres: '',
    leverancierLand: '',
    cmrNumber: '',
    pefcNumber: '',
    steresOpCmr: '',
    houtType: 'Dennenhout',
    volume: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [vooraanmeldingen, setVooraanmeldingen] = useState<any[]>([])
  const [selectedVooraanmelding, setSelectedVooraanmelding] = useState<any>(null)
  const [showVooraanmeldingen, setShowVooraanmeldingen] = useState(true)

  useEffect(() => {
    // Laad vooraanmeldingen, maar filter uit die al een ontvangst (zelfde CMR) hebben
    const opgeslagenVooraanmeldingen = JSON.parse(localStorage.getItem('vooraanmeldingen') || '[]')
    const opgeslagenOntvangsten = JSON.parse(localStorage.getItem('ontvangsten') || '[]')
    const onverwerkte = opgeslagenVooraanmeldingen.filter((v: any) => {
      if (!v.isValid) return false
      // als er al een ontvangst bestaat met hetzelfde CMR nummer, beschouwen we de vooraanmelding als verwerkt
      const processed = opgeslagenOntvangsten.some((o: any) => o.cmrNumber && v.cmrNumber && o.cmrNumber === v.cmrNumber)
      return !processed
    })
    setVooraanmeldingen(onverwerkte)
    
    // Haal data uit URL parameters als ze bestaan
    const eudr = searchParams.get('eudr')
    const traces = searchParams.get('traces')
    const chauffeur = searchParams.get('chauffeur')
    
    if (eudr && traces && chauffeur) {
      setFormData(prev => ({
        ...prev,
        eudrNumber: eudr,
        tracesId: traces,
        chauffeurNaam: decodeURIComponent(chauffeur)
      }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validatie
    if (!formData.eudrNumber || !formData.tracesId || !formData.leverancierNaam || 
        !formData.cmrNumber || !formData.pefcNumber || formData.volume <= 0) {
      alert('Vul alle verplichte velden in')
      setIsSubmitting(false)
      return
    }

    // Simuleer opslaan naar database
    setTimeout(() => {
      const ontvangst: Ontvangst = {
        id: `ONT-${Date.now()}`,
        eudrNumber: formData.eudrNumber,
        tracesId: formData.tracesId,
        leverancier: {
          naam: formData.leverancierNaam,
          adres: formData.leverancierAdres,
          land: formData.leverancierLand,
        },
        cmrNumber: formData.cmrNumber,
        pefcNumber: formData.pefcNumber,
        houtType: formData.houtType,
        volume: Number(formData.volume),
        steresOpCmr: formData.steresOpCmr ? Number(formData.steresOpCmr) : undefined,
        ontvangstDatum: new Date(),
        chauffeurNaam: formData.chauffeurNaam,
      }

      // Opslaan in localStorage voor demo doeleinden
      const bestaandeOntvangsten = JSON.parse(localStorage.getItem('ontvangsten') || '[]')
      bestaandeOntvangsten.push(ontvangst)
      localStorage.setItem('ontvangsten', JSON.stringify(bestaandeOntvangsten))

      // Ook toevoegen aan voorraad
      const voorraadItem = {
        id: `VRD-${Date.now()}`,
        tracesId: formData.tracesId,
        ontvangstId: ontvangst.id,
        houtType: formData.houtType,
        volume: Number(formData.volume),
        beschikbaarVolume: Number(formData.volume),
        leverancier: formData.leverancierNaam,
        ontvangstDatum: new Date(),
        status: 'beschikbaar'
      }

      const bestaandeVoorraad = JSON.parse(localStorage.getItem('voorraad') || '[]')
      bestaandeVoorraad.push(voorraadItem)
      localStorage.setItem('voorraad', JSON.stringify(bestaandeVoorraad))

      // Verwijder gekoppelde vooraanmelding(s) omdat deze nu verwerkt is (op basis van CMR / EUDR / TRACES)
      try {
        const opgeslagenVooraanmeldingen = JSON.parse(localStorage.getItem('vooraanmeldingen') || '[]')
        const filtered = opgeslagenVooraanmeldingen.filter((v: any) => {
          if (!v) return false
          const sameCmr = v.cmrNumber && v.cmrNumber === ontvangst.cmrNumber
          const sameEudr = v.eudrNumber && v.eudrNumber === ontvangst.eudrNumber
          const sameTraces = v.tracesId && v.tracesId === ontvangst.tracesId
          return !(sameCmr || sameEudr || sameTraces)
        })
        localStorage.setItem('vooraanmeldingen', JSON.stringify(filtered))
        setVooraanmeldingen(filtered.filter((v: any) => v.isValid))
      } catch (err) {
        // noop
      }

      setIsSubmitting(false)
      setSubmitSuccess(true)
    }, 2000)
  }

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-verhoeven-green mb-2">Ontvangst Succesvol Geregistreerd!</h1>
            <p className="text-gray-600 mb-6">
              De levering is toegevoegd aan de voorraad met TRACES ID: <strong>{formData.tracesId}</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/voorraad"
                className="bg-verhoeven-green text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Bekijk Voorraad
              </Link>
              <Link
                href="/eudr-validatie"
                className="bg-wood-brown text-white px-6 py-3 rounded-lg hover:bg-yellow-800 transition-colors"
              >
                Nieuwe Ontvangst
              </Link>
              <Link
                href="/"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hoofdmenu
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectVooraanmelding = (vooraanmelding: any) => {
    setSelectedVooraanmelding(vooraanmelding)
    setFormData(prev => ({
      ...prev,
      eudrNumber: vooraanmelding.eudrNumber,
      tracesId: vooraanmelding.tracesId,
      cmrNumber: vooraanmelding.cmrNumber,
      // zet het door de CMR opgegeven aantal steres apart; houd 'volume' voor de gemeten waarde
      steresOpCmr: String(vooraanmelding.aantalSteres),
    }))
    setShowVooraanmeldingen(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Vooraangemelde vrachten */}
      {showVooraanmeldingen && vooraanmeldingen.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-verhoeven-green">Goedgekeurde Vooraanmeldingen</h2>
            <button
              onClick={() => setShowVooraanmeldingen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Handmatige invoer →
            </button>
          </div>
          <p className="text-gray-600 mb-4">Selecteer een vooraangemelde vracht om snel te registreren:</p>
          
          <div className="grid gap-3">
            {vooraanmeldingen.map((vooraanmelding) => (
              <div
                key={vooraanmelding.id}
                onClick={() => selectVooraanmelding(vooraanmelding)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">EUDR:</span>
                        <span className="ml-1">{vooraanmelding.eudrNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">CMR:</span>
                        <span className="ml-1">{vooraanmelding.cmrNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Steres:</span>
                        <span className="ml-1">{vooraanmelding.aantalSteres}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vooraanmelding.country} • {vooraanmelding.validatedAt ? new Date(vooraanmelding.validatedAt).toLocaleString('nl-NL') : ''}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Goedgekeurd
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-verhoeven-green">Ontvangst Registratie</h1>
          <div className="flex gap-2">
            {!showVooraanmeldingen && vooraanmeldingen.length > 0 && (
              <button
                onClick={() => setShowVooraanmeldingen(true)}
                className="text-verhoeven-green hover:underline text-sm"
              >
                ← Vooraanmeldingen
              </button>
            )}
            <Link href="/" className="text-verhoeven-green hover:underline">
              ← Terug naar hoofdmenu
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EUDR & TRACES Info (readonly als vanuit validatie gekomen) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EUDR Nummer *
              </label>
              <input
                type="text"
                name="eudrNumber"
                value={formData.eudrNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                placeholder="EUDR-2024-001"
                required
                disabled={!!searchParams.get('eudr')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TRACES ID *
              </label>
              <input
                type="text"
                name="tracesId"
                value={formData.tracesId}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                placeholder="TRACES-ABC123"
                required
                disabled={!!searchParams.get('traces')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chauffeur Naam *
              </label>
              <input
                type="text"
                name="chauffeurNaam"
                value={formData.chauffeurNaam}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                placeholder="Jan Jansen"
                required
                disabled={!!searchParams.get('chauffeur')}
              />
            </div>
          </div>

          {/* Leverancier informatie */}
          <div>
            <h3 className="text-lg font-semibold text-verhoeven-green mb-3">Leverancier Informatie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leverancier Naam *
                </label>
                <input
                  type="text"
                  name="leverancierNaam"
                  value={formData.leverancierNaam}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="Holz GmbH"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  name="leverancierAdres"
                  value={formData.leverancierAdres}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="Waldstraße 123, München"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land
                </label>
                <select
                  name="leverancierLand"
                  value={formData.leverancierLand}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                >
                  <option value="">Selecteer land</option>
                  <option value="Nederland">Nederland</option>
                  <option value="Duitsland">Duitsland</option>
                  <option value="België">België</option>
                  <option value="Frankrijk">Frankrijk</option>
                  <option value="Polen">Polen</option>
                  <option value="Oostenrijk">Oostenrijk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transport & Certificering */}
          <div>
            <h3 className="text-lg font-semibold text-verhoeven-green mb-3">Transport & Certificering</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CMR Nummer *
                </label>
                <input
                  type="text"
                  name="cmrNumber"
                  value={formData.cmrNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="CMR-2024-12345"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PEFC Nummer *
                </label>
                <input
                  type="text"
                  name="pefcNumber"
                  value={formData.pefcNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="PEFC/01-23-45"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steres op CMR
                </label>
                <input
                  type="number"
                  name="steresOpCmr"
                  value={formData.steresOpCmr || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="Aantal steres zoals op de CMR"
                  step="0.5"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Hout specificaties */}
          <div>
            <h3 className="text-lg font-semibold text-verhoeven-green mb-3">Hout Specificaties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Houtsoort *
                </label>
                <select
                  name="houtType"
                  value={formData.houtType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  required
                >
                  <option value="Dennenhout">Dennenhout</option>
                  <option value="Vurenhout">Vurenhout</option>
                  <option value="Eikenhout">Eikenhout</option>
                  <option value="Beukenhout">Beukenhout</option>
                  <option value="Berkenhout">Berkenhout</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (m³) *
                </label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verhoeven-green focus:border-transparent"
                  placeholder="25.5"
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/eudr-validatie"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Terug
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-verhoeven-green text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registreren...
                </div>
              ) : (
                'Ontvangst Registreren'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// Simulatie van TRACES systeem data
const MOCK_TRACES_DATA = {
  'EUDR-2024-001': { valid: true, country: 'Duitsland', region: 'Bayern', certification: 'FSC' },
  'EUDR-2024-002': { valid: true, country: 'Polen', region: 'Mazowieckie', certification: 'PEFC' },
  'EUDR-2024-003': { valid: false, country: 'Onbekend', region: '', certification: '' },
  'EUDR-2024-004': { valid: true, country: 'België', region: 'Ardennen', certification: 'FSC' },
  'EUDR-2024-005': { valid: true, country: 'Frankrijk', region: 'Bourgogne', certification: 'PEFC' },
}

interface VooraanmeldingData {
  id: string;
  eudrNumber: string;
  cmrNumber: string;
  aantalSteres: number;
  tracesId: string;
  validatedAt: Date;
  isValid: boolean;
  country: string;
  region: string;
  certification: string;
}

export default function EUDRValidatie() {
  const [eudrNumber, setEudrNumber] = useState('')
  const [cmrNumber, setCmrNumber] = useState('')
  const [aantalSteres, setAantalSteres] = useState<number>(0)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<VooraanmeldingData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const eudrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus op EUDR veld wanneer form gereset wordt
    if (!validationResult && eudrInputRef.current) {
      eudrInputRef.current.focus()
    }
  }, [validationResult])

  const validateEUDR = async () => {
    if (!eudrNumber.trim() || !cmrNumber.trim() || aantalSteres <= 0) {
      alert('Vul alle velden in')
      return
    }

    setIsValidating(true)
    
    // Simuleer API call naar TRACES systeem
    setTimeout(() => {
      const result = MOCK_TRACES_DATA[eudrNumber as keyof typeof MOCK_TRACES_DATA]
      
      if (result) {
        const vooraanmelding: VooraanmeldingData = {
          id: `AANM-${Date.now()}`,
          eudrNumber,
          cmrNumber,
          aantalSteres,
          tracesId: `TRACES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          isValid: result.valid,
          country: result.country,
          region: result.region,
          certification: result.certification,
          validatedAt: new Date()
        }
        
        setValidationResult(vooraanmelding)
        setShowModal(true)
        
        // Sla goedgekeurde vooraanmeldingen op voor gebruik bij ontvangst
        if (result.valid) {
          const bestaandeVooraanmeldingen = JSON.parse(localStorage.getItem('vooraanmeldingen') || '[]')
          bestaandeVooraanmeldingen.push(vooraanmelding)
          localStorage.setItem('vooraanmeldingen', JSON.stringify(bestaandeVooraanmeldingen))
        }
      } else {
        setValidationResult({
          id: `AANM-${Date.now()}`,
          eudrNumber,
          cmrNumber,
          aantalSteres,
          tracesId: '',
          isValid: false,
          country: 'Onbekend',
          region: '',
          certification: '',
          validatedAt: new Date()
        })
        setShowModal(true)
      }
      
      setIsValidating(false)
    }, 2000) // 2 seconden delay voor realistische simulatie
  }

  const resetForm = () => {
    setEudrNumber('')
    setCmrNumber('')
    setAantalSteres(0)
    setValidationResult(null)
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-20 h-20 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">🚛</span>
            </div>
            <h1 className="text-3xl font-bold text-wood-brown mb-2">Verhoeven Emballage</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chauffeur Vracht Aanmelding</h2>
            <p className="text-gray-600">Meld je vracht aan voor EUDR controle</p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Chauffeur formulier - Grote knoppen voor tablet gebruik */}
          <div className="space-y-6">


            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                EUDR Nummer *
              </label>
              <input
                ref={eudrInputRef}
                type="text"
                value={eudrNumber}
                onChange={(e) => setEudrNumber(e.target.value.toUpperCase())}
                className="w-full p-6 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-forest-green focus:border-forest-green text-center font-mono"
                placeholder="EUDR-2024-001"
                disabled={isValidating}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                CMR Nummer *
              </label>
              <input
                type="text"
                value={cmrNumber}
                onChange={(e) => setCmrNumber(e.target.value.toUpperCase())}
                className="w-full p-6 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-forest-green focus:border-forest-green text-center font-mono"
                placeholder="CMR-2024-12345"
                disabled={isValidating}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Aantal Steres *
              </label>
              <input
                type="number"
                value={aantalSteres || ''}
                onChange={(e) => setAantalSteres(Number(e.target.value))}
                className="w-full p-6 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-forest-green focus:border-forest-green text-center"
                placeholder="25"
                min="1"
                step="0.5"
                disabled={isValidating}
              />
            </div>

            <button
              onClick={validateEUDR}
              disabled={isValidating || !eudrNumber.trim() || !cmrNumber.trim() || aantalSteres <= 0}
              className="w-full bg-forest-green text-white py-8 px-8 text-2xl font-bold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isValidating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
                  Controleren via TRACES...
                </div>
              ) : (
                '✓ Controleer Vracht'
              )}
            </button>

            {validationResult && (
              <button
                onClick={resetForm}
                className="w-full bg-gray-500 text-white py-6 px-6 text-xl font-semibold rounded-xl hover:bg-gray-600 transition-colors shadow-lg"
              >
                🔄 Nieuwe Vracht Aanmelden
              </button>
            )}
          </div>
        </div>

        {/* Instructies voor chauffeur */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-400">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructies:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Voer het EUDR nummer van je vrachtbrief in</li>
                <li>• Voer het CMR nummer in</li>
                <li>• Voer het aantal steres hout in</li>
                <li>• Klik op "Controleer Vracht"</li>
                <li>• Bij goedkeuring rijd je door naar het Meetstation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact informatie */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="text-center">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Problemen met aanmelding?</h4>
              <p className="text-yellow-700 text-sm mb-2">
              Neem contact op met het Meetstation of administratie
            </p>
            <div className="text-yellow-800 font-mono text-lg">
              📞 Tel: 0123-456789
            </div>
          </div>
        </div>
      </div>

      {/* Modal pop-up voor validatie resultaat */}
      {showModal && validationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-gray-200">
            <div className="p-8 text-center">
              {validationResult.isValid ? (
                <div>
                  {/* Grote groene vinkje */}
                  <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-6xl font-bold">✓</span>
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-4">Vracht Goedgekeurd!</h2>
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-1 gap-4 text-left">
                      <div>
                        <p className="text-sm text-gray-600">CMR Nummer</p>
                        <p className="font-semibold text-lg">{validationResult.cmrNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">EUDR Nummer</p>
                        <p className="font-semibold text-lg">{validationResult.eudrNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Aantal Steres</p>
                        <p className="font-semibold text-lg">{validationResult.aantalSteres}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-6 text-left">
                    <p><strong>TRACES ID:</strong> {validationResult.tracesId}</p>
                    <p><strong>Herkomst:</strong> {validationResult.country} ({validationResult.region})</p>
                    <p><strong>Validatie:</strong> {validationResult.validatedAt.toLocaleString('nl-NL')}</p>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    Je vracht is vooraangemeld en goedgekeurd. Rijd naar het Meetstation voor ontvangst.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                      <p className="text-xl font-bold">🚛 Rijd naar het Meetstation!</p>
                      <p className="text-sm opacity-90 mt-1">Je vracht is goedgekeurd voor ontvangst</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-gray-500 text-white py-6 px-8 text-xl font-semibold rounded-xl hover:bg-gray-600 transition-colors shadow-lg"
                    >
                      ✓ Begrepen
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Grote rode kruis */}
                  <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-6xl font-bold">✗</span>
                  </div>
                  <h2 className="text-3xl font-bold text-red-600 mb-4">Vracht Afgekeurd</h2>
                  <div className="bg-red-50 p-6 rounded-lg mb-6">
                    <p className="text-lg text-gray-700">
                      Het EUDR nummer <strong>{validationResult.eudrNumber}</strong> is niet geldig.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Controleer het nummer en probeer opnieuw, of neem contact op met de dispatcher.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={resetForm}
                      className="w-full bg-blue-500 text-white py-6 px-8 text-xl font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      🔄 Probeer Opnieuw
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-gray-500 text-white py-6 px-8 text-xl font-semibold rounded-xl hover:bg-gray-600 transition-colors shadow-lg"
                    >
                      ❌ Sluiten
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BatchDetailsPage(){
  const params = useParams()
  const batch = params?.batch || ''
  const [run, setRun] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    try{
      const runs = JSON.parse(localStorage.getItem('productieRuns') || '[]')
      const found = runs.find((r:any)=> r.batchNummer === batch)
      setRun(found || null)
    }catch(e){
      setRun(null)
    }finally{
      setLoading(false)
    }
  },[batch])

  if(loading) return <div className="p-6">Laden...</div>

  if(!run) return (
    <div className="max-w-4xl mx-auto p-6">
      <p className="text-gray-600">Geen batch gevonden voor {batch}</p>
      <Link href="/voorraad" className="text-forest-green hover:underline">Terug naar voorraad</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold">Batch {run.batchNummer}</h2>
        <div className="text-sm text-gray-500">Productie datum: {new Date(run.productieDatum).toLocaleDateString('nl-NL')}</div>
        <div className="mt-3">
          <h3 className="font-medium">Output producten</h3>
          <ul className="list-disc pl-5 mt-2">
            {run.outputProducts?.map((p:any, i:number)=> (
              <li key={i}>{p.naam} — {p.hoeveelheid} {p.eenheid}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium">TRACES in deze batch ({run.gebruikteTraces?.length || 0})</h3>
        {(!run.gebruikteTraces || run.gebruikteTraces.length === 0) ? (
          <p className="text-gray-500">Geen TRACES geregistreerd voor deze batch.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {run.gebruikteTraces.map((t:string, idx:number)=> (
              <li key={idx} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-forest-green">{t}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Link href="/voorraad" className="text-forest-green hover:underline">← Terug naar Voorraad</Link>
      </div>
    </div>
  )
}

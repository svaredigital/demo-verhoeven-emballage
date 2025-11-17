import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-verhoeven-green text-white py-6 px-6 shadow-lg overflow-visible">
      <div className="container mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <div
              className="bg-white rounded-md p-1 shadow-lg"
              style={{ transform: 'translateY(6px)', display: 'inline-block' }}
            >
              <img
                src="/verhoeven-logo.png"
                alt="Verhoeven's Zagerij en Houthandel"
                className="h-14 w-auto object-contain block"
                style={{ maxWidth: 520 }}
              />
            </div>
          </Link>

          <div className="border-l border-verhoeven-gold pl-6 flex flex-col justify-center">
            <h1 className="text-xl font-bold leading-tight">EUDR Traceability Systeem</h1>
            <p className="text-verhoeven-gold text-sm">Demo Applicatie</p>
          </div>
        </div>
      </div>
    </header>
  )
}

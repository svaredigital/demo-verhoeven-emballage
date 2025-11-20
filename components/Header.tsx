import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-verhoeven-green text-white py-6 px-6 shadow-lg overflow-visible">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <div
              className="bg-white rounded-md p-1 shadow-lg"
              style={{ transform: 'translateY(6px)', display: 'inline-block' }}
            >
              <img
                src="/verhoeven-logo.png"
                alt="Verhoeven's Zagerij en Houthandel"
                className="h-10 md:h-14 w-auto object-contain block"
                style={{ maxWidth: '240px' }}
              />
            </div>
          </Link>

          <div className="border-l border-verhoeven-gold pl-4 md:pl-6 flex flex-col justify-center min-w-0">
            <h1 className="text-sm md:text-xl font-bold leading-tight">EUDR Traceability Systeem</h1>
            <p className="text-verhoeven-gold text-xs md:text-sm">Demo Applicatie</p>
          </div>
        </div>
      </div>
    </header>
  )
}

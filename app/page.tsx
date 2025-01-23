import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="w-[180px] h-[60px] mb-6">
            <Image
              src="/images/certifica-logo.svg"
              alt="Certifica Logo"
              width={180}
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Benvenuto in Certifica
          </h1>
          <p className="text-gray-600 text-center max-w-2xl">
            La piattaforma per la gestione delle certificazioni
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Box Login */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-t-blue-600">
            <h2 className="text-2xl font-bold mb-6 text-center">Accedi</h2>
            <p className="text-gray-600 mb-8 text-center">
              Accedi al tuo account per gestire le tue certificazioni
            </p>
            <Link 
              href="/login" 
              className="block w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-center transition-colors"
            >
              Accedi
            </Link>
          </div>

          {/* Box Registrazione */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-t-orange-500">
            <h2 className="text-2xl font-bold mb-6 text-center">Registrati</h2>
            <p className="text-gray-600 mb-8 text-center">
              Crea un nuovo account per accedere ai servizi
            </p>
            <div className="space-y-4">
              <Link 
                href="/register" 
                className="block w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-center transition-colors"
              >
                Registrati
              </Link>
              <Link 
                href="/contatti" 
                className="block w-full py-3 px-4 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-medium rounded-lg text-center transition-colors"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
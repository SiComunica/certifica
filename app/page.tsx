import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Home Page</h1>
      <nav className="space-y-4">
        <div>
          <Link 
            href="/auth/login" 
            className="text-blue-500 hover:underline"
          >
            Vai al Login
          </Link>
        </div>
        <div>
          <Link 
            href="/dashboard" 
            className="text-blue-500 hover:underline"
          >
            Vai alla Dashboard
          </Link>
        </div>
      </nav>
    </main>
  )
} 
import ApiTest from "../components/api-test"
import DbTest from "../components/db-test"

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pagina di Test</h1>
      <div className="space-y-4">
        <ApiTest />
        <DbTest />
      </div>
    </div>
  )
} 
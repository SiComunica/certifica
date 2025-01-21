import { Metadata } from "next"
import { CertificationRequestForm } from "@/components/certification-request-form"

export const metadata: Metadata = {
  title: "Nuova Richiesta",
  description: "Richiedi una nuova certificazione del contratto",
}

export default function NewRequestPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nuova Richiesta di Certificazione</h1>
        <div className="p-6 bg-white rounded-lg shadow">
          <CertificationRequestForm />
        </div>
      </div>
    </div>
  )
} 
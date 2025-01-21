import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Unauthorized() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-red-600">
            Accesso Non Autorizzato
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Non hai i permessi necessari per accedere a questa pagina.
          </p>
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button>
                Torna alla Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
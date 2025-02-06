"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function CommissionInvites() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<any[]>([])
  const [inviteCode, setInviteCode] = useState("")
  const supabase = createClientComponentClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/commission/invite-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio dell\'invito')
      }

      setInviteCode(data.code)
      toast.success('Codice invito generato')
      loadInvites()
    } catch (error: any) {
      toast.error(error.message || 'Errore nell\'invio dell\'invito')
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_invite_codes')
        .select(`
          id,
          email,
          code,
          created_at,
          expires_at,
          used
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(data || [])
    } catch (error) {
      console.error('Errore caricamento inviti:', error)
      toast.error('Errore nel caricamento degli inviti')
    }
  }

  useEffect(() => {
    loadInvites()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Invita Membro Commissione</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Generazione...' : 'Genera Codice'}
                </Button>
              </div>
            </div>

            {inviteCode && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="font-bold mb-2">Codice Invito Generato:</p>
                <p className="text-2xl text-blue-600 font-mono">{inviteCode}</p>
                <p className="mt-2 text-sm">
                  Link registrazione:<br/>
                  <a 
                    href="/auth/commission-register" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    /auth/commission-register
                  </a>
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Inviti Inviati</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invites.length === 0 ? (
              <p className="text-center text-gray-500">Nessun invito inviato</p>
            ) : (
              invites.map((invite) => (
                <Card key={invite.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-gray-500">
                          Codice: {invite.code}
                        </p>
                        <p className="text-sm text-gray-500">
                          Inviato il: {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stato: {invite.used ? 'Utilizzato' : 'Non utilizzato'}
                        </p>
                        {!invite.used && (
                          <p className="text-sm text-gray-500">
                            Scade il: {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
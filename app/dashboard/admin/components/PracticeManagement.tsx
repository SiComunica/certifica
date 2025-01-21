'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import type { Practice, Member, Comment } from '@/app/types'

export default function PracticeManagement() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState('')
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const loadPractices = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('practices')
        .select('*')
        .in('status', ['submitted_to_commission', 'in_progress', 'completed', 'rejected'])
        .order('created_at', { ascending: false })

      if (data) {
        setPractices(data)
      }
    } catch (error) {
      console.error('Errore caricamento pratiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data } = await supabase
        .from('members')
        .select('*')

      if (data) {
        setMembers(data)
      }
    } catch (error) {
      console.error('Errore caricamento membri:', error)
    }
  }

  const loadComments = async (practiceId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(full_name)
      `)
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Errore caricamento commenti:', error)
      return
    }

    setComments(prev => ({
      ...prev,
      [practiceId]: data as Comment[]
    }))
  }

  const addComment = async (practiceId: string) => {
    if (!newComment.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('practice_comments')
        .insert({
          practice_id: practiceId,
          user_id: user?.id,
          content: newComment
        })

      if (error) throw error

      setNewComment('')
      loadComments(practiceId)
      toast.success('Commento aggiunto con successo')
    } catch (error) {
      console.error('Errore aggiunta commento:', error)
      toast.error('Errore nell\'aggiunta del commento')
    }
  }

  const updateStatus = async (practiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      // Invia notifica email
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'status_update',
          practiceId,
          newStatus
        })
      })

      toast.success('Stato aggiornato con successo')
      loadPractices()
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      toast.error('Errore nell\'aggiornamento dello stato')
    }
  }

  const assignPractice = async (practiceId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({
          assigned_to: memberId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      // Invia notifica email
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assignment',
          practiceId,
          memberId
        })
      })

      toast.success('Pratica assegnata con successo')
      loadPractices()
    } catch (error) {
      console.error('Errore assegnazione pratica:', error)
      toast.error('Errore nell\'assegnazione della pratica')
    }
  }

  const takeCharge = async (practiceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('practices')
        .update({
          assigned_to: user.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      toast.success('Pratica presa in carico con successo')
      loadPractices()
    } catch (error) {
      console.error('Errore presa in carico:', error)
      toast.error('Errore nella presa in carico della pratica')
    }
  }

  useEffect(() => {
    loadPractices()
    loadMembers()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestione Pratiche</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {practices.map(practice => (
            <div key={practice.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    Pratica #{practice.practice_number || practice.id.slice(0, 8)}
                  </h3>
                  <p className="text-gray-600">
                    Dipendente: {practice.employee_name}
                  </p>
                  <p className="text-gray-600">
                    Tipo Contratto: {practice.contract_type}
                  </p>
                  <p className={`text-sm font-medium ${
                    practice.status === 'completed' ? 'text-green-600' :
                    practice.status === 'rejected' ? 'text-red-600' :
                    practice.status === 'in_progress' ? 'text-blue-600' :
                    practice.status === 'submitted_to_commission' ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    Stato: {
                      practice.status === 'submitted_to_commission' 
                        ? 'In attesa di assegnazione' 
                        : practice.status
                    }
                  </p>
                </div>

                <div className="flex gap-4">
                  {practice.status === 'submitted_to_commission' ? (
                    <button
                      onClick={() => takeCharge(practice.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Prendi in Carico
                    </button>
                  ) : (
                    <>
                      <select
                        onChange={(e) => assignPractice(practice.id, e.target.value)}
                        value={practice.assigned_to || ''}
                        className="border rounded px-3 py-1"
                      >
                        <option value="">Assegna a...</option>
                        {members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.full_name}
                          </option>
                        ))}
                      </select>

                      <select
                        onChange={(e) => updateStatus(practice.id, e.target.value)}
                        value={practice.status}
                        className="border rounded px-3 py-1"
                      >
                        <option value="in_progress">In Lavorazione</option>
                        <option value="completed">Completata</option>
                        <option value="rejected">Rifiutata</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Sezione Commenti */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Commenti</h4>
                <div className="space-y-2 mb-4">
                  {comments[practice.id]?.map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{comment.user.full_name}</span>
                        <span>{new Date(comment.created_at).toLocaleString('it-IT')}</span>
                      </div>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Aggiungi un commento..."
                    className="flex-1 border rounded px-3 py-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addComment(practice.id)
                      }
                    }}
                  />
                  <button
                    onClick={() => addComment(practice.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Invia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
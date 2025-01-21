"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { Search, Tag, Filter } from 'lucide-react'

interface Practice {
  id: string
  status: 'submitted' | 'in_progress' | 'completed' | 'rejected'
  assigned_to: string | null
  submitted_at: string
  started_at: string | null
  completed_at: string | null
  notes: string | null
  user_id: string
  profiles: {
    full_name: string
    email: string
  }
  practice_comments: PracticeComment[]
  practice_to_tags: {
    practice_tags: {
      id: string
      name: string
      color: string
    }
  }[]
}

interface PracticeComment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
  }
}

interface PracticeTag {
  id: string
  name: string
  color: string
}

export default function CommissionPracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Practice['status']>('submitted')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<PracticeTag[]>([])
  const [comment, setComment] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClientComponentClient()

  // Carica pratiche e tag disponibili
  useEffect(() => {
    loadPractices()
    loadTags()
  }, [filter, searchQuery, selectedTags])

  const loadTags = async () => {
    const { data: tags, error } = await supabase
      .from('practice_tags')
      .select('*')
      .order('name')

    if (error) {
      toast.error('Errore nel caricamento dei tag')
      return
    }

    setAvailableTags(tags)
  }

  const loadPractices = async () => {
    try {
      let query = supabase
        .from('practices')
        .select(`
          *,
          profiles!practices_user_id_fkey (
            full_name,
            email
          ),
          practice_comments (
            id,
            content,
            created_at,
            user_id,
            profiles (
              full_name
            )
          ),
          practice_to_tags (
            practice_tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('status', filter)
        .order('submitted_at', { ascending: false })

      // Applica filtro di ricerca
      if (searchQuery) {
        query = query.textSearch('search_vector', searchQuery)
      }

      // Filtra per tag selezionati
      if (selectedTags.length > 0) {
        query = query.contains('practice_to_tags', selectedTags)
      }

      const { data, error } = await query

      if (error) throw error
      setPractices(data || [])

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nel caricamento pratiche')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (practiceId: string) => {
    if (!comment.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('practice_comments')
        .insert([{
          practice_id: practiceId,
          user_id: user.id,
          content: comment
        }])

      if (error) throw error

      toast.success('Commento aggiunto')
      setComment('')
      loadPractices()

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nell\'aggiunta del commento')
    }
  }

  const handleTagToggle = async (practiceId: string, tagId: string) => {
    try {
      const practice = practices.find(p => p.id === practiceId)
      const hasTag = practice?.practice_to_tags.some(
        t => t.practice_tags.id === tagId
      )

      if (hasTag) {
        // Rimuovi tag
        const { error } = await supabase
          .from('practice_to_tags')
          .delete()
          .eq('practice_id', practiceId)
          .eq('tag_id', tagId)

        if (error) throw error
      } else {
        // Aggiungi tag
        const { error } = await supabase
          .from('practice_to_tags')
          .insert([{
            practice_id: practiceId,
            tag_id: tagId
          }])

        if (error) throw error
      }

      loadPractices()

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nella gestione dei tag')
    }
  }

  const handleAssign = async (practiceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('practices')
        .update({ 
          status: 'in_progress',
          assigned_to: user.id,
          started_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      // Invia notifica all'utente
      const practice = practices.find(p => p.id === practiceId)
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: practice?.profiles.email,
          template: 'practiceInProgress',
          data: {
            practiceId,
            userName: practice?.profiles.full_name
          }
        })
      })

      toast.success('Pratica presa in carico')
      loadPractices()

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nella presa in carico')
    }
  }

  const handleComplete = async (practiceId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          status: approved ? 'completed' : 'rejected',
          completed_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      // Invia notifica all'utente
      const practice = practices.find(p => p.id === practiceId)
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: practice?.profiles.email,
          template: approved ? 'practiceCompleted' : 'practiceRejected',
          data: {
            practiceId,
            userName: practice?.profiles.full_name
          }
        })
      })

      toast.success(approved ? 'Pratica completata' : 'Pratica rifiutata')
      loadPractices()

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nel completamento pratica')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pratiche Commissione</h1>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            <Filter size={20} />
            Filtri
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-white rounded-lg shadow space-y-4">
            {/* Barra di ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca nelle pratiche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded"
              />
            </div>

            {/* Filtri stato */}
            <div className="flex gap-2">
              {['submitted', 'in_progress', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as Practice['status'])}
                  className={`px-4 py-2 rounded ${
                    filter === status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Selezione tag */}
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag.id) 
                      ? prev.filter(id => id !== tag.id)
                      : [...prev, tag.id]
                  )}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{ borderColor: tag.color }}
                >
                  <Tag size={14} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Caricamento...</p>
        </div>
      ) : practices.length === 0 ? (
        <p className="text-center text-gray-500">
          Nessuna pratica trovata
        </p>
      ) : (
        <div className="space-y-4">
          {practices.map((practice) => (
            <div key={practice.id} 
              className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="space-y-4">
                {/* Intestazione pratica */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Pratica #{practice.id}</h3>
                    <p className="text-sm text-gray-600">
                      Utente: {practice.profiles.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Inviata il: {new Date(practice.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Tag della pratica */}
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(practice.id, tag.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          practice.practice_to_tags.some(t => t.practice_tags.id === tag.id)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Tag size={12} />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commenti */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Commenti</h4>
                  {practice.practice_comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                      <p className="font-medium">{comment.profiles.full_name}</p>
                      <p>{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  {/* Form nuovo commento */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Aggiungi un commento..."
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={() => handleAddComment(practice.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Invia
                    </button>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex justify-end gap-2">
                  {practice.status === 'submitted' && (
                    <button
                      onClick={() => handleAssign(practice.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Prendi in Carico
                    </button>
                  )}
                  {practice.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleComplete(practice.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approva
                      </button>
                      <button
                        onClick={() => handleComplete(practice.id, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Rifiuta
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
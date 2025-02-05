"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

type NotificationType = 'practice_created' | 'practice_comment' | 'status_update' | 'request_documents' | 'request_clarification' | 'approval' | 'rejection' | 'request_hearing'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  created_at: string
  read: boolean
  practice_id: string | null
  type: NotificationType
}

export default function Notifications() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log("DEBUG: Notifications component mounted")
    
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log("DEBUG: Current user:", user?.id)

        if (!user) {
          console.error("DEBUG: No user found")
          return
        }

        // Fetch notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error("DEBUG: Error fetching notifications:", error)
          return
        }

        console.log("DEBUG: Fetched notifications:", data)
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)

        // Setup realtime subscription
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log("DEBUG: Realtime notification received:", payload)
              toast.success("Nuova notifica ricevuta!")
              fetchNotifications() // Reload notifications
            }
          )
          .subscribe((status) => {
            console.log("DEBUG: Subscription status:", status)
          })

        return () => {
          console.log("DEBUG: Cleaning up subscription")
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error("DEBUG: Error in fetchNotifications:", error)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento della notifica: ${error.message}`)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento delle notifiche: ${error.message}`)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} min fa`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ore fa`
    
    return d.toLocaleDateString('it-IT')
  }

  const getNotificationStyle = (type: NotificationType) => {
    switch(type) {
      case 'practice_created':
        return 'bg-green-50'
      case 'practice_comment':
        return 'bg-blue-50'
      case 'request_documents':
      case 'request_clarification':
        return 'bg-yellow-50'
      case 'approval':
        return 'bg-green-50'
      case 'rejection':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 text-gray-400 hover:text-gray-500 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Notifiche</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Segna tutte come lette
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nessuna notifica
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                      notification.read ? 'bg-white' : getNotificationStyle(notification.type)
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                        {notification.practice_id && (
                          <p className="text-xs text-blue-600 mt-1">
                            Pratica: {notification.practice_id}
                          </p>
                        )}
                      </div>
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
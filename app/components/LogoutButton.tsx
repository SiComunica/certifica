'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { RiLogoutBoxLine } from 'react-icons/ri'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
    >
      <RiLogoutBoxLine className="mr-3 h-5 w-5" />
      Logout
    </button>
  )
} 
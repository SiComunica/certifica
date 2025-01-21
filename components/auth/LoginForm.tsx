"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    console.log('Login data:', data)
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Accedi</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true })}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2.5"
            >
              {showPassword ? "Nascondi" : "Mostra"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Accedi
        </button>
      </form>

      <div className="text-center text-sm">
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Non hai un account? Registrati
        </Link>
      </div>
    </div>
  )
} 
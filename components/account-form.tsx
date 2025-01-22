"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface AccountFormValues {
  name?: string
  email?: string
  bio?: string
}

export function AccountForm() {
  const { register, handleSubmit } = useForm<AccountFormValues>()

  function onSubmit(data: AccountFormValues) {
    // Usiamo il nuovo formato semplificato del toast
    toast({
      message: `Impostazioni aggiornate: ${JSON.stringify(data)}`,
      variant: "success"
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Nome
        </label>
        <Input
          {...register("name")}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Email
        </label>
        <Input
          type="email"
          {...register("email")}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Bio
        </label>
        <Input
          {...register("bio")}
          className="mt-1"
        />
      </div>

      <Button type="submit">
        Aggiorna profilo
      </Button>
    </form>
  )
} 
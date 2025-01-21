import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { AccountForm } from "@/components/account-form"

export const metadata: Metadata = {
  title: "Impostazioni",
  description: "Gestisci le impostazioni del tuo account.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Impostazioni</h3>
        <p className="text-sm text-muted-foreground">
          Gestisci le impostazioni del tuo account e le preferenze.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">
          <AccountForm />
        </div>
      </div>
    </div>
  )
} 
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Certifica",
  description: "Piattaforma di certificazione",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
} 
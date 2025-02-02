import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

export default function Home() {
  // Reindirizza alla pagina di login con CIE
  redirect("/auth/login")
} 
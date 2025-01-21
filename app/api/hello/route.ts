import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  // Log per debug
  console.log("API Hello: richiesta ricevuta")
  
  // Risposta semplice
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString()
  })
} 
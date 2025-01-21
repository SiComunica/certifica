import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test 1: Connessione base
    console.log("1. Test connessione base...")
    await db.$connect()
    console.log("Connessione OK")

    // Test 2: Query semplice
    console.log("2. Test query semplice...")
    const testResult = await db.$queryRaw`SELECT current_timestamp`
    console.log("Query OK:", testResult)

    // Test 3: Verifica schema
    console.log("3. Test schema...")
    const tableInfo = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("Tabelle trovate:", tableInfo)

    return NextResponse.json({
      status: "ok",
      connection: "success",
      tables: tableInfo,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]+@/, ':****@')
    })

  } catch (error: any) {
    console.error("Errore database:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    return NextResponse.json({
      status: "error",
      message: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 })
  }
} 
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test 1: Verifica che possiamo eseguire una query semplice
    console.log("Test 1: Query semplice")
    const testQuery = await db.$queryRaw`SELECT 1 as test`
    console.log("Risultato test 1:", testQuery)

    // Test 2: Verifica che la tabella esista
    console.log("Test 2: Verifica tabella")
    const tableTest = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'DocumentInstance'
      );
    `
    console.log("Risultato test 2:", tableTest)

    return NextResponse.json({
      success: true,
      test1: testQuery,
      test2: tableTest,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]+@/, ':****@')
    })

  } catch (error: any) {
    console.error("Errore test database:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 })
  }
} 
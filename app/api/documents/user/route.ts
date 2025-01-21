import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dati di test
    const testData = {
      message: "Test endpoint",
      timestamp: new Date().toISOString(),
      templates: [
        { id: 1, name: "Test Template 1" },
        { id: 2, name: "Test Template 2" }
      ]
    }

    console.log("Debug: Endpoint chiamato", testData)
    
    return NextResponse.json(testData)
    
  } catch (error: any) {
    console.error("Errore:", error)
    return NextResponse.json({ 
      error: error.message,
      location: "Test endpoint error"
    }, { status: 500 })
  }
} 
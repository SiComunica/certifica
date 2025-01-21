import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  console.log("=== INIZIO CHIAMATA API ===")
  
  try {
    console.log("4. Inizio query Supabase...")
    const { data, error } = await supabase
      .from('pdf_templates')
      .select(`
        id,
        name,
        description,
        file_path,
        contract_type_id
      `)
    console.log("5. Query completata", { data: !!data, error: !!error })

    if (error) {
      console.error("6. Errore Supabase:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log("7. Nessun template trovato")
      return NextResponse.json([])
    }

    console.log("8. Formattazione dati...")
    const templates = data.map(template => ({
      id: template.id.toString(),
      name: template.name || "Senza nome",
      description: template.description || "",
      category: "contratti",
      url: template.file_path,
      contractTypeId: template.contract_type_id
    }))

    console.log("9. Risposta con successo:", templates.length, "templates")
    return NextResponse.json(templates)

  } catch (error: any) {
    console.error("!!! ERRORE !!!")
    console.error("Messaggio:", error.message)
    console.error("Stack:", error.stack)
    console.error("Dettagli:", error)
    
    return NextResponse.json({ 
      error: "Errore del server. Riprova più tardi.",
      details: error.message 
    }, { status: 500 })
  }
} 
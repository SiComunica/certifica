import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PriceRange {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number | null
  base_price: string
  is_percentage: boolean
  percentage_value: string | null
  threshold_value: string | null
  max_price: string | null
  is_odcec: boolean
  is_renewal: boolean
}

export async function getPriceForContract(contractTypeId: number, quantity: number) {
  const supabase = createClientComponentClient()
  
  try {
    const { data, error } = await supabase
      .from('price_ranges')
      .select('*')
      .eq('contract_type_id', contractTypeId)
      .lte('min_quantity', quantity)
      .gte('max_quantity', quantity)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Errore nel calcolo del prezzo:', error)
    throw error
  }
}

export async function getAllPriceRanges() {
  const supabase = createClientComponentClient()
  
  try {
    const { data, error } = await supabase
      .from('price_ranges')
      .select(`
        *,
        contract_types (
          id,
          name,
          code
        )
      `)
      .order('contract_type_id')
      .order('min_quantity')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Errore nel recupero delle tariffe:', error)
    throw error
  }
} 
import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  try {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('your_table')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
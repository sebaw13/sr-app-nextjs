import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const arbeitsstatus = searchParams.get('arbeitsstatus')

  let query = supabase
    .from('videoszenen')
    .select('*')
    .order('created_at', { ascending: false })

  if (arbeitsstatus) {
    query = query.eq('arbeitsstatus', arbeitsstatus)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { arbeitsstatus } = req.query

  let query = supabase.from('videoszenen').select('*').order('created_at', { ascending: false })

  if (arbeitsstatus && typeof arbeitsstatus === 'string') {
    query = query.eq('arbeitsstatus', arbeitsstatus)
  }

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(data)
}

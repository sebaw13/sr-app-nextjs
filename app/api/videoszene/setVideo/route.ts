// Server-Side Route zum Setzen der Video-Verknüpfung
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { videoszeneId, fileId } = await req.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from('videoszenen')
    .update({ video_file_id: fileId })
    .eq('id', videoszeneId);

  if (error) {
    console.error('[SetVideo]', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
}

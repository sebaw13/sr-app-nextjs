// app/api/uploadVideo/route.ts
export async function POST(req: Request) {
    const body = await req.json();
  
    const res = await fetch(
      `${process.env.SUPABASE_FUNCTION_URL}/uploadVideo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );
  
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
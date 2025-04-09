// app/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const {
    data: { session },
  } = await (await supabase).auth.getSession();

  // Wenn kein User eingeloggt ist → zur Sign-in Page
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Willkommen im SR-Portal ⚽</h1>
      {/* Hier kannst du dein Dashboard / Einstieg anzeigen */}
    </div>
  );
}

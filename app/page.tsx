// app/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SzenenGrid from '@/components/SzeneGrid';

<SzenenGrid />

export default async function Home() {
  const supabase = createClient();
  const {
    data: { session },
  } = await (await supabase).auth.getSession();

  // Wenn kein User eingeloggt ist → zur Sign-in Page
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Willkommen im SR-Portal ⚽</h1>
      <SzenenGrid />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MeineDatenPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      setUser(userData.user);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          bezirk:bezirke (id, name),
          ligatyp:ligatypen (id, name)
        `)
        .eq('id', userData.user.id)
        .single();

      if (error) {
        console.error('❌ Fehler beim Laden des Profils:', error);
      } else {
        setProfil(profileData);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted || !user || !profil) return null;

  let rollen: string[] = [];
  try {
    if (profil.rollen && typeof profil.rollen === 'string') {
      rollen = JSON.parse(profil.rollen);
    } else if (Array.isArray(profil.rollen)) {
      rollen = profil.rollen;
    }
  } catch (e) {
    console.warn('⚠️ Rollen konnten nicht geparsed werden:', profil.rollen);
    rollen = [];
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📄 Meine Profildaten</h1>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p><strong>👤 Name:</strong> {profil.vorname} {profil.name}</p>
          <p><strong>📧 E-Mail:</strong> {profil.email ?? user.email}</p>
          <p><strong>🔔 Benachrichtigungen:</strong> {profil.notifications ? 'Ja' : 'Nein'}</p>
          <p><strong>💾 Eigene Ansicht:</strong> {profil.save_view ? 'Gespeichert' : 'Nicht gespeichert'}</p>
          <p><strong>🏋️‍♂️ NLZ:</strong> {profil.nlz ? 'Ja' : 'Nein'}</p>
          <p><strong>📍 Bezirk:</strong> {profil.bezirk?.name ?? '—'}</p>
          <p><strong>🏆 Ligatyp:</strong> {profil.ligatyp?.name ?? '—'}</p>

          <p><strong>🧑‍💼 Rollen:</strong></p>
          <div className="flex flex-wrap gap-2">
            {rollen.length > 0
              ? rollen.map((rolle) => (
                  <Badge key={rolle} variant="secondary">{rolle}</Badge>
                ))
              : <span className="text-muted">Keine Rollen</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Entity = { id: number; titel?: string; name?: string };
type Zuordnung = {
  id: number;
  saison: number;
  liga: number;
  verein: number;
};

export default function ZugehoerigkeitenPage() {
  const supabase = createClient();
  const [zuordnungen, setZuordnungen] = useState<Zuordnung[]>([]);
  const [saisons, setSaisons] = useState<Entity[]>([]);
  const [ligen, setLigen] = useState<Entity[]>([]);
  const [vereine, setVereine] = useState<Entity[]>([]);
  const [selectedSaison, setSelectedSaison] = useState<number | undefined>();
  const [selectedVereinForLiga, setSelectedVereinForLiga] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const [z, s, l, v] = await Promise.all([
        supabase.from('ligazuordnungen').select('*'),
        supabase.from('saisons').select('*'),
        supabase.from('ligen').select('*'),
        supabase.from('vereine').select('*')
      ]);

      if (z.data) setZuordnungen(z.data);
      if (s.data) {
        setSaisons(s.data);
        if (!selectedSaison && s.data.length) {
          setSelectedSaison(s.data[0].id);
        }
      }
      if (l.data) setLigen(l.data);
      if (v.data) setVereine(v.data);

      setLoading(false);
    };

    loadAll();
  }, [supabase]);

  const getName = (list: Entity[], id: number) =>
    list.find((item) => item.id === id)?.titel ??
    list.find((item) => item.id === id)?.name ??
    '⎯';

  const groupedByLiga = useMemo(() => {
    const grouped: Record<number, number[]> = {};
    zuordnungen
      .filter((z) => z.saison === selectedSaison)
      .forEach((z) => {
        if (!grouped[z.liga]) grouped[z.liga] = [];
        grouped[z.liga].push(z.verein);
      });
    return grouped;
  }, [zuordnungen, selectedSaison]);

  const handleAddVerein = async (ligaId: number) => {
    const vereinId = selectedVereinForLiga[ligaId];
    if (!vereinId || !selectedSaison) return;

    await supabase.from('ligazuordnungen').insert([
      {
        liga: ligaId,
        saison: selectedSaison,
        verein: vereinId
      }
    ]);

    // Refresh
    const { data } = await supabase.from('ligazuordnungen').select('*');
    if (data) setZuordnungen(data);
    setSelectedVereinForLiga((prev) => ({ ...prev, [ligaId]: 0 }));
  };

  const handleRemoveVerein = async (ligaId: number, vereinId: number) => {
    if (!selectedSaison) return;

    await supabase
      .from('ligazuordnungen')
      .delete()
      .eq('liga', ligaId)
      .eq('verein', vereinId)
      .eq('saison', selectedSaison);

    const { data } = await supabase.from('ligazuordnungen').select('*');
    if (data) setZuordnungen(data);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">🔗 Zugehörigkeiten</h1>

      {!loading && saisons.length > 0 && (
        <Select value={String(selectedSaison)} onValueChange={(val) => setSelectedSaison(Number(val))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Saison wählen" />
          </SelectTrigger>
          <SelectContent>
            {saisons.map((saison) => (
              <SelectItem key={saison.id} value={String(saison.id)}>
                {saison.titel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(groupedByLiga).map(([ligaIdStr, vereinsIds]) => {
            const ligaId = Number(ligaIdStr);
            const ligaName = getName(ligen, ligaId);
            const zugewieseneIds = new Set(vereinsIds);
            const verfügbareVereine = vereine.filter((v) => !zugewieseneIds.has(v.id));

            return (
              <Card key={ligaId}>
                <CardContent className="p-4 space-y-3">
                  <h2 className="text-xl font-semibold">{ligaName}</h2>
                  <ul className="space-y-1">
                    {vereinsIds.map((vereinId) => (
                      <li key={vereinId} className="flex justify-between items-center">
                        <span>{getName(vereine, vereinId)}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveVerein(ligaId, vereinId)}
                        >
                          Entfernen
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 pt-4">
                    <Select
                      value={selectedVereinForLiga[ligaId]?.toString() ?? ''}
                      onValueChange={(val) =>
                        setSelectedVereinForLiga((prev) => ({
                          ...prev,
                          [ligaId]: Number(val)
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Verein hinzufügen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {verfügbareVereine.map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => handleAddVerein(ligaId)}
                      className="w-full"
                      disabled={!selectedVereinForLiga[ligaId]}
                    >
                      Verein hinzufügen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

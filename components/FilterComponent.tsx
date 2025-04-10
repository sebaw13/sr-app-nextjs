'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';

type Props = {
  activeTab: string;
  selectedCategory?: string;
  selectedTheme: string[];
  minRating: number;
  maxRating: number;
  selectedSeason?: string;
  selectedLeague?: string;
  selectedClub?: string;
  vereine: { id: number; name: string }[];
};

export default function FilterComponent({
  activeTab,
  selectedCategory,
  selectedTheme,
  minRating,
  maxRating,
  selectedSeason,
  selectedLeague,
  selectedClub,
  vereine,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [tabValue, setTabValue] = useState(activeTab);

  const updateParam = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, String(value));
    params.set('tab', tabValue);
    params.set('page', '1');
    startTransition(() => {
      router.replace(`/alle-szenen?${params.toString()}`);
    });
  };

  const handleTabChange = (value: string) => {
    setTabValue(value);
    updateParam('tab', value);
  };

  return (
    <div className="mb-6">
      <Tabs defaultValue={tabValue} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="Thema">Thema</TabsTrigger>
          <TabsTrigger value="Bewertung">Bewertung</TabsTrigger>
          <TabsTrigger value="Verein">Verein / Liga / Saison</TabsTrigger>
        </TabsList>

        {tabValue === 'Thema' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Themen (Kommagetrennt)</label>
              <input
                type="text"
                className="input input-bordered w-full"
                defaultValue={selectedTheme.join(',')}
                onBlur={(e) => updateParam('themen', e.target.value)}
              />
            </div>
          </div>
        )}

        {tabValue === 'Bewertung' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kategorie</label>
              <Select onValueChange={(value) => updateParam('kategorie', value)} defaultValue={selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technik">Technik</SelectItem>
                  <SelectItem value="Taktik">Taktik</SelectItem>
                  <SelectItem value="Kognition">Kognition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Bewertung (1–6)</label>
              <Slider
                defaultValue={[minRating, maxRating]}
                min={1}
                max={6}
                step={1}
                onValueChange={(value) => {
                  updateParam('ratingMin', value[0]);
                  updateParam('ratingMax', value[1]);
                }}
              />
              <p className="text-sm mt-1">Min: {minRating} – Max: {maxRating}</p>
            </div>
          </div>
        )}

        {tabValue === 'Verein' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Verein</label>
              <Select onValueChange={(value) => updateParam('verein', value)} defaultValue={selectedClub}>
                <SelectTrigger>
                  <SelectValue placeholder="Verein wählen" />
                </SelectTrigger>
                <SelectContent>
                  {vereine.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Saison</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="z.B. 2023/24"
                defaultValue={selectedSeason}
                onBlur={(e) => updateParam('saison', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Liga</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="z.B. Bundesliga"
                defaultValue={selectedLeague}
                onBlur={(e) => updateParam('liga', e.target.value)}
              />
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}

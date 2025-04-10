// /components/TabNavigation.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransition } from 'react';

type Props = {
  activeTab: string;
};

export default function TabNavigation({ activeTab }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    params.set('page', '1'); // Pagination zurücksetzen
    startTransition(() => {
      router.replace(`/alle-szenen?${params.toString()}`);
    });
  };

  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="Thema">Thema</TabsTrigger>
          <TabsTrigger value="Verein">Verein / Liga</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

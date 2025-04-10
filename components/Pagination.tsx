'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useTransition } from 'react';

type Props = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
};

export default function Pagination({ totalItems, currentPage, itemsPerPage }: Props) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  const goToPage = (page: number) => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.replace(`/alle-szenen?${params.toString()}`);
    });
  };

  if (totalPages <= 1 || !searchParams) return null;

  const pageNumbers: number[] = [];
  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
    if (i > 0 && i <= totalPages) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="flex justify-between items-center pt-6 border-t pt-4">
      {/* Zurück */}
      {currentPage > 1 ? (
        <Button variant="outline" onClick={() => goToPage(currentPage - 1)}>
          ← Zurück
        </Button>
      ) : (
        <div />
      )}

      {/* Seitenzahlen */}
      <div className="flex space-x-2">
        {/* Erste Seite (wenn fehlt) */}
        {pageNumbers[0] > 1 && (
          <>
            <Button variant="outline" onClick={() => goToPage(1)}>
              1
            </Button>
            {pageNumbers[0] > 2 && <span className="px-2">…</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}

        {/* Letzte Seite (wenn fehlt) */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-2">…</span>}
            <Button variant="outline" onClick={() => goToPage(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Weiter */}
      {currentPage < totalPages ? (
        <Button variant="outline" onClick={() => goToPage(currentPage + 1)}>
          Weiter →
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}

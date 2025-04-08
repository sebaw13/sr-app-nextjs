// app/dashboard/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { Card, CardContent } from 'components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'components/ui/table';
import { Button } from 'components/ui/button';

const supabase = await createClient();


export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    // Mock-Daten als Platzhalter, später durch Supabase-Query ersetzen
    const mockUsers = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      name: `Nachname ${i}`,
      vorname: `Vorname ${i}`,
      email: `user${i}@example.com`,
      rolle: 'Admin',
      bezirk: 'Bezirk A',
      spielklasse: 'Regionalliga',
      nlz: i % 2 === 0 ? 'Ja' : 'Nein',
    }));
    setUsers(mockUsers);
  }, []);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
      <Card>
        <CardContent className="overflow-x-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vorname</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Rolle</TableHead>
                <TableHead className="hidden lg:table-cell">Bezirk</TableHead>
                <TableHead className="hidden xl:table-cell">Spielklasse</TableHead>
                <TableHead className="hidden md:table-cell">NLZ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="cursor-pointer hover:bg-muted">
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.vorname}</TableCell>
                  <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{u.rolle}</TableCell>
                  <TableCell className="hidden lg:table-cell">{u.bezirk}</TableCell>
                  <TableCell className="hidden xl:table-cell">{u.spielklasse}</TableCell>
                  <TableCell className="hidden md:table-cell">{u.nlz}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
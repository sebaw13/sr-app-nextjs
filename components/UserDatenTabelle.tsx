"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface UserData {
  id: string;
  name: string;
  vorname: string;
  email: string;
  rolle: string;
  bezirk: string;
  spielklasse: string;
  nlz: string;
  source: "profiles" | "up_users";
}

export default function UserDatenTabelle() {
  const [users, setUsers] = useState<UserData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const [profilesRes, legacyRes] = await Promise.all([
        supabase.from("profiles").select("id, name, vorname, email, rollen, bezirk, ligatyp, nlz"),
        supabase.from("up_users").select("id, name, vorname, email, rollen, bezirk, ligatyp, nlz")
      ]);

      const profiles: UserData[] =
        profilesRes.data?.flatMap((user: any) => {
          const rollen = JSON.parse(user.rollen || "[]");
          return rollen.map((rolle: string) => ({
            id: user.id,
            name: user.name || "",
            vorname: user.vorname || "",
            email: user.email || "",
            rolle,
            bezirk: user.bezirk?.toString() || "",
            spielklasse: user.ligatyp?.toString() || "",
            nlz: user.nlz?.toString() || "",
            source: "profiles"
          }));
        }) || [];

      const legacy: UserData[] =
        legacyRes.data?.flatMap((user: any) => {
          const rollen = JSON.parse(user.rollen || "[]");
          return rollen.map((rolle: string) => ({
            id: user.id,
            name: user.name || "",
            vorname: user.vorname || "",
            email: user.email || "",
            rolle,
            bezirk: user.bezirk?.toString() || "",
            spielklasse: user.ligatyp?.toString() || "",
            nlz: user.nlz?.toString() || "",
            source: "up_users"
          }));
        }) || [];

      setUsers([...legacy, ...profiles]);
    };

    fetchUsers();
  }, []);

  return (
    <Card className="p-4">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vorname</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Bezirk</TableHead>
              <TableHead>Spielklasse</TableHead>
              <TableHead>NLZ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Keine Nutzer gefunden.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={`${user.id}-${user.rolle}`}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.vorname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.rolle}</TableCell>
                  <TableCell>{user.bezirk}</TableCell>
                  <TableCell>{user.spielklasse}</TableCell>
                  <TableCell>{user.nlz}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

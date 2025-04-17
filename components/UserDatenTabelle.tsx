"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface UserData {
  id: string | number;
  name: string;
  vorname: string;
  email: string;
  rollen: string;
  bezirk: string;
  spielklasse: string;
  nlz: boolean;
}

type TabKey = "alle" | "sr" | "beo" | "funktionaere";

const rollenFilter: Record<TabKey, (u: UserData) => boolean> = {
  alle: () => true,
  sr: (u) => u.rollen.includes("SR"),
  beo: (u) => u.rollen.includes("BEO"),
  funktionaere: (u) =>
    ["KT", "VSA", "BSA", "LW", "GSO"].some((r) => u.rollen.includes(r)),
};

export default function UserDatenTabelle() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabKey>("alle");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [nlzFilter, setNlzFilter] = useState("alle");
  const [sortKey, setSortKey] = useState<keyof UserData>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const parseRollen = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.startsWith("[")) return JSON.parse(raw);
    if (typeof raw === "string") return raw.split(",");
    return [String(raw)];
  };

  const transformUser = (user: any): UserData => {
    const rollen = parseRollen(user.rollen).join(", ");
    return {
      id: user.id,
      name: user.name || "",
      vorname: user.vorname || "",
      email: user.email || "",
      rollen,
      bezirk: user.bezirk?.name || user.bezirk || "",
      spielklasse: user.ligatyp?.name || user.ligatyp || "",
      nlz: !!user.nlz,
    };
  };

  useEffect(() => {
    fetch("/api/userdaten")
      .then((res) => (res.ok ? res.json() : Promise.reject("Nicht autorisiert")))
      .then((data) => {
        console.log("👥 Benutzer geladen:", data.users?.length);
        setUsers((data.users || []).map(transformUser));
      })
      .catch((err) => {
        console.error("❌ Fehler beim Laden:", err);
        setUsers([]);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedTab, search, nlzFilter, itemsPerPage]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(rollenFilter[selectedTab])
      .filter((u) => {
        if (nlzFilter === "true") return u.nlz;
        if (nlzFilter === "false") return !u.nlz;
        return true;
      })
      .filter((u) => {
        const s = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(s) ||
          u.vorname.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.rollen.toLowerCase().includes(s) ||
          u.bezirk.toLowerCase().includes(s) ||
          u.spielklasse.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, selectedTab, search, nlzFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (users.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Keine Nutzer gefunden oder keine Berechtigung.
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <Tabs
        value={selectedTab}
        onValueChange={(val) => setSelectedTab(val as TabKey)}
        className="space-y-2"
      >
        <TabsList>
          <TabsTrigger value="alle">Alle</TabsTrigger>
          <TabsTrigger value="sr">Schiedsrichter</TabsTrigger>
          <TabsTrigger value="beo">Coaches</TabsTrigger>
          <TabsTrigger value="funktionaere">Funktionäre</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab}>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Input
              placeholder="Suche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => setItemsPerPage(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Einträge/Seite" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / Seite
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nlzFilter} onValueChange={setNlzFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="NLZ Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle</SelectItem>
                <SelectItem value="true">Nur NLZ</SelectItem>
                <SelectItem value="false">Ohne NLZ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {(["name", "vorname", "email", "rollen", "bezirk", "spielklasse"] as const).map(
                    (key) => (
                      <TableHead
                        key={key}
                        onClick={() => {
                          setSortKey(key);
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        }}
                        className="cursor-pointer select-none"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                        {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </TableHead>
                    )
                  )}
                  <TableHead>NLZ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Keine Nutzer gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.vorname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.rollen}</TableCell>
                      <TableCell>{user.bezirk}</TableCell>
                      <TableCell>{user.spielklasse}</TableCell>
                      <TableCell>{user.nlz ? "✅" : ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="secondary"
            >
              Zurück
            </Button>
            <span className="text-sm text-muted-foreground">
              Seite {page} von {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              variant="secondary"
            >
              Weiter
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

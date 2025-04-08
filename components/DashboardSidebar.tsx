"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UserCircle,
  BarChart2,
  FolderKanban,
  Settings,
  Mail,
  ShieldCheck,
  Users,
  Layers,
  SquareTerminal,
  ArrowLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 🔐 Beispielhafte Rollenlogik
const user = {
  name: "Admin User",
  email: "admin@example.com",
  avatar: "/avatars/shadcn.jpg",
  sr_rolle: [{ rolle: "KT" }, { rolle: "VSA" }],
};

const hasRole = (roles: string[]) =>
  user?.sr_rolle?.some((r) => roles.includes(r.rolle));

// Navigation: dynamisch, rollenbasiert
const navMain = [
  {
    title: "Meine Daten",
    url: "/dashboard/meine-daten",
    icon: UserCircle,
  },
  {
    title: "Meine Spiele",
    url: "/dashboard/meine-spiele",
    icon: FolderKanban,
  },
  {
    title: "Statistiken",
    url: "/dashboard/statistiken",
    icon: BarChart2,
    roles: ["KT", "VSA", "BSA"],
  },
  {
    title: "Userdaten",
    url: "/dashboard/userdaten",
    icon: Users,
    roles: ["KT", "VSA", "BSA"],
  },
  {
    title: "Videoszenen",
    url: "/dashboard/videoszenen-verwalten",
    icon: Layers,
    roles: ["KT"],
    items: [
      { title: "Verwalten", url: "/dashboard/videoszenen-verwalten" },
      { title: "Release Manager", url: "/dashboard/release-manager" },
    ],
  },
  {
    title: "Ligaverwaltung",
    url: "/dashboard/vereinsverwaltung",
    icon: LayoutDashboard,
    roles: ["KT"],
    items: [
      { title: "Vereinsverwaltung", url: "/dashboard/vereinsverwaltung" },
      { title: "Zugehörigkeiten", url: "/dashboard/zugehoerigkeiten" },
    ],
  },
  {
    title: "Systemverwaltung",
    url: "/dashboard/systemparameter",
    icon: Settings,
    roles: ["KT"],
    items: [
      { title: "Systemparameter", url: "/dashboard/systemparameter" },
      { title: "Email-Liste", url: "/dashboard/email-liste" },
      { title: "Migration", url: "/dashboard/migration" },
    ],
  },
];

const projects = [
  {
    name: "Spielberichte",
    url: "#",
    icon: SquareTerminal,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const filteredNav = navMain
    .filter((item) => !item.roles || hasRole(item.roles))
    .map((item) => {
      const subIsActive = item.items?.some((sub) => pathname.startsWith(sub.url)) ?? false;
      const isActive = pathname.startsWith(item.url) || subIsActive;
      return {
        ...item,
        isActive,
        items: item.items?.map((sub) => ({
          ...sub,
          isActive: pathname === sub.url,
        })),
      };
    });

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-none"
    >
      <SidebarHeader>
        <div className="flex items-center px-4 py-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={36}
            className="mr-2"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="text-[hsl(var(--primary-foreground))]">
        <NavMain items={filteredNav} />
        <div className="mt-4 border-t pt-4 px-3">
          <Link
            href="/"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zum Portal
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter className="text-[hsl(var(--primary-foreground))]">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

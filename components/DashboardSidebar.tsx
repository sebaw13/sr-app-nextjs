"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UserCircle,
  BarChart2,
  FolderKanban,
  Settings,
  ArrowLeft,
  Users,
  Layers,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/utils/supabase/client";
type Role = {
  rolle: string;
};

type UserProfile = {
  name: string;
  email: string;
  rollen: string[]; // 👈 direkt als Array von Strings
};

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

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Session:", session);
      if (sessionError || !session?.user) {
        console.error("Session-Fehler:", sessionError);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, email, rollen")
        .eq("id", session.user.id)
        .single();

      console.log("Profil:", profile);
      if (profileError) {
        console.error("Profil-Fehler:", profileError);
      } else {
        setUser(profile); // rollen ist bereits string[]
      }
    };

    fetchUser();
  }, []);

  const hasRole = (roles: string[]) =>
    user?.rollen?.some((r) => roles.includes(r));

  const filteredNav = React.useMemo(() => {
    if (!user) return [];
    return navMain
      .filter((item) => !item.roles || hasRole(item.roles))
      .map((item) => {
        const subIsActive = item.items?.some((sub) =>
          pathname.startsWith(sub.url)
        );
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
  }, [pathname, user]);

  if (!user) {
    return (
      <Sidebar
        collapsible="icon"
        className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-none"
      >
        <SidebarHeader>
          <div className="px-4 py-2 text-sm">Lade Benutzerdaten...</div>
        </SidebarHeader>
      </Sidebar>
    );
  }

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
            className="flex items-center text-sm font-medium text-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary-foreground))]/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zum Portal
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter className="text-[hsl(var(--primary-foreground))]">
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Aktuelle Szenen", href: "/aktuelle-szenen" },
  { label: "Alle Szenen", href: "/alle-szenen" },
  { label: "Verwaltung", href: "/dashboard" },
];

export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    const supabase = createClient();

    // Abmelden des Benutzers
    const { error } = await supabase.auth.signOut();

    // Fehlerbehandlung beim Logout
    if (error) {
      console.error("Fehler beim Logout:", error.message);
      return;
    }

    // Benutzer erfolgreich abgemeldet, Weiterleitung zur Login-Seite
    router.push("/sign-in");
  };

  return (
    <>
      <div className="flex justify-center mt-6 z-50">
        <div className="bg-primary text-primary-foreground shadow-md px-6 py-4 w-full max-w-screen-xl mx-auto flex justify-between items-center">
          {/* Mobile: Hamburger Button (optional) */}
          <div className="lg:hidden">
            {/* Optional: Toggle Button */}
          </div>

          {/* Logo */}
          <div className="flex justify-center w-full lg:justify-start lg:w-auto">
            <Link href="/" onClick={closeMenu} className="btn btn-ghost p-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "hover:underline font-medium",
                  pathname === link.href && "underline underline-offset-4"
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 underline hover:no-underline font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {isMenuOpen && (
        <div
          id="menu-overlay"
          className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-start"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "menu-overlay") {
              setMenuOpen(false);
            }
          }}
        >
          <div className="bg-primary text-primary-foreground w-11/12 max-w-sm mt-20 rounded-lg shadow-lg z-50 p-4">
            <ul className="flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-lg font-medium hover:underline"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block w-full text-lg font-medium hover:underline"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

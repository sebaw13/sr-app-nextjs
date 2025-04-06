"use client";

import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import clsx from "clsx";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Alle Routen, in denen die Navbar NICHT gezeigt werden soll
    const hideOn = ["/dashboard"];
    const hide = hideOn.some((path) => pathname?.startsWith(path));
    setShowNavbar(!hide);
  }, [pathname]);

  return (
    <html lang="de" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            {showNavbar && <Navbar />}

            <div className={clsx("w-full", showNavbar && "max-w-screen-xl mx-auto px-5")}>
              {children}
            </div>

            {!pathname?.startsWith("/dashboard") && (
              <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-16">
                <p>
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            )}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

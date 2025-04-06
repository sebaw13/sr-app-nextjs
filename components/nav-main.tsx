"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

type SubItem = {
  title: string
  url: string
  isActive?: boolean
}

type NavItem = {
  title: string
  url: string
  icon?: React.ElementType
  isActive?: boolean
  items?: SubItem[]
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const pathname = usePathname()

  React.useEffect(() => {
    const initialOpen: Record<string, boolean> = {}
    items.forEach((item) => {
      if (item.items?.some((sub) => pathname.startsWith(sub.url))) {
        initialOpen[item.url] = true
      }
    })
    setOpen(initialOpen)
  }, [items, pathname])

  const toggle = (url: string) => {
    setOpen((prev) => ({ ...prev, [url]: !prev[url] }))
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        const isOpen = open[item.url]

        return (
          <div key={item.title}>
            {item.items?.length ? (
              <button
                onClick={() => toggle(item.url)}
                className={cn(
                  "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                  item.isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
                {isOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                )}
              </button>
            ) : (
              <Link
                href={item.url}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                  item.isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            )}

            {item.items?.length && isOpen ? (
              <div className="ml-6 mt-1 space-y-1">
                {item.items.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.url}
                    className={cn(
                      "block rounded-md px-3 py-1 text-sm transition-all hover:bg-muted",
                      sub.isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

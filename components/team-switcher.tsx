"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Team = {
  name: string
  plan: string
  logo?: React.ElementType
}

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-1 px-3 py-2">
      {teams.map((team) => {
        const Icon = team.logo
        return (
          <div
            key={team.name}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm transition-all hover:bg-muted cursor-pointer"
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <div className="flex flex-col">
              <span className="font-medium">{team.name}</span>
              <span className="text-xs text-muted-foreground">{team.plan}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

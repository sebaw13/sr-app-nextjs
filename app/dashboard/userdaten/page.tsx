"use client";

import UserDatenTabelle from "@/components/UserDatenTabelle";

export default function UserdatenPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">👥 Userdaten</h1>
      <UserDatenTabelle />
    </div>
  );
}

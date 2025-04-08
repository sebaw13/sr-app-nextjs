import { DashboardSidebar } from "components/DashboardSidebar"
import { SidebarProvider } from "components/ui/sidebar" // <– Wichtig

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}

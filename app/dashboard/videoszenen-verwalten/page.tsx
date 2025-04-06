// pages/dashboard/videoszenen-verwalten.tsx
import VideoszenenKanban from '@/components/VideoszenenKanban'

export default function VideoszenenVerwaltenPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Videoszenen verwalten</h1>
      <VideoszenenKanban />
    </main>
  )
}

import { Outlet } from 'react-router-dom'
import { Sidebar, MobileNav } from './Sidebar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-warm-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="md:pl-60 pb-16 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

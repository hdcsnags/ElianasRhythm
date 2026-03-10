import { Outlet } from 'react-router-dom'
import { Sidebar, MobileNav } from './Sidebar'

export default function AppShell() {
  return (
    <div className="h-screen bg-night overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="md:pl-[72px] pb-14 md:pb-0 h-screen overflow-hidden">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

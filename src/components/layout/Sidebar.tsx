import { NavLink, useNavigate } from 'react-router-dom'
import { Bird, ScrollText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

interface NavItem {
  to: string
  icon: typeof Bird
  label: string
}

const navItems: NavItem[] = [
  { to: '/companion', icon: Bird, label: 'Companion' },
  { to: '/history', icon: ScrollText, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? 'E'

  return (
    <aside className="fixed inset-y-0 left-0 w-[72px] bg-deep border-r border-gold/[0.07] flex flex-col items-center py-6 gap-2 z-20">
      <NavLink to="/" className="font-serif text-[1.4rem] text-gold mb-6 hover:opacity-80 transition-opacity">
        E
      </NavLink>

      <nav className="flex flex-col items-center gap-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative w-11 h-11 flex items-center justify-center rounded-sm transition-all duration-200',
                isActive
                  ? 'bg-gold/[0.12] text-gold'
                  : 'text-cream/[0.28] hover:text-cream'
              )
            }
            title={label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-[20%] bottom-[20%] w-0.5 bg-gold rounded-r -translate-x-px" />
                )}
                <Icon className="w-[1.1rem] h-[1.1rem]" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <button
        onClick={handleSignOut}
        className="w-11 h-11 flex items-center justify-center rounded-sm text-cream/[0.28] hover:text-cream transition-colors mb-2"
        title="Sign out"
      >
        <LogOut className="w-[1.1rem] h-[1.1rem]" />
      </button>

      <button
        onClick={() => navigate('/settings')}
        className="w-9 h-9 rounded-full bg-gold/[0.12] border border-gold/25 flex items-center justify-center text-[0.75rem] text-gold font-display cursor-pointer hover:border-gold/40 transition-colors"
        title={user?.email ?? 'Profile'}
      >
        {initials}
      </button>
    </aside>
  )
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-deep border-t border-gold/[0.07] flex items-center justify-around px-2 py-2 z-20 md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-[0.65rem] font-display tracking-wider uppercase transition-colors',
              isActive ? 'text-gold' : 'text-cream/[0.28]'
            )
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

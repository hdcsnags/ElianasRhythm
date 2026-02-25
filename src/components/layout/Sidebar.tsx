import { NavLink, useNavigate } from 'react-router-dom'
import { Home, MessageCircle, BookOpen, Settings, LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

interface NavItem {
  to: string
  icon: typeof Home
  label: string
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/companion', icon: MessageCircle, label: 'Companion' },
  { to: '/history', icon: BookOpen, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-warm-900 flex flex-col z-20">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-warm-800">
        <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-warm-50 font-semibold text-base leading-none">Eliana</h1>
          <p className="text-warm-500 text-xs mt-0.5">Spiritual Companion</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-amber-700/20 text-amber-400 font-medium'
                  : 'text-warm-400 hover:text-warm-100 hover:bg-warm-800'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-warm-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-warm-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-warm-500 hover:text-warm-200 hover:bg-warm-800 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const navItems: NavItem[] = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/companion', icon: MessageCircle, label: 'Companion' },
    { to: '/history', icon: BookOpen, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex items-center justify-around px-2 py-2 z-20 md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors',
              isActive ? 'text-amber-700' : 'text-stone-500'
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

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, KanbanSquare, Users, LogOut,
  Menu, X, ChevronRight, Bell
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  {
    to: '/dashboard/overview',
    icon: LayoutDashboard,
    label: 'Aperçu',
    description: 'KPIs & statistiques',
  },
  {
    to: '/dashboard/pipeline',
    icon: KanbanSquare,
    label: 'Pipeline',
    description: 'Devis & projets',
  },
  {
    to: '/dashboard/clients',
    icon: Users,
    label: 'Clients',
    description: 'Annuaire clients',
  },
]

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'AD'
  const userName = user?.email?.split('@')[0] || 'Admin'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-emerald-950 font-bold text-sm flex-shrink-0">
            MC
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-white leading-tight">
              Menuiserie Conan
            </p>
            <p className="text-xs text-emerald-400">Administration</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-emerald-400/70 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, description }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-200'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-none mb-0.5">{label}</p>
                  <p className={`text-[11px] leading-none ${isActive ? 'text-amber-400/70' : 'text-stone-500'}`}>
                    {description}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight size={14} className="text-amber-400 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-emerald-950 font-bold text-xs flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate capitalize">{userName}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-emerald-950 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-emerald-950 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-stone-400">
              Bienvenue, <span className="font-medium text-stone-700 capitalize">{userName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-emerald-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:border-emerald-200 transition-colors"
            >
              Voir le site public
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

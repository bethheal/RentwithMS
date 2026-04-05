import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Wallet,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppShell } from '../../context/AppShellContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { dashboardNavSections } from '../../data/navigation.js'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'
import { classNames } from '../../utils/classNames.js'
import BrandMark from '../common/BrandMark.jsx'

const iconMap = {
  bell: Bell,
  building: Building2,
  layout: LayoutDashboard,
  settings: Settings,
  wallet: Wallet,
}

function SidebarContent() {
  const { logout, user } = useAuth()

  return (
    <div className="flex h-full flex-col bg-brand-950 p-5 text-white">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
        <BrandMark theme="light" />
        <p className="mt-4 text-sm leading-6 text-white/70">
          A future-ready shell for authenticated rental workflows.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {dashboardNavSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon]

                return (
                  <NavLink
                    key={`${section.title}-${item.label}`}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      classNames(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-white text-brand-950 shadow-soft'
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                      )
                    }
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Account</p>
        <p className="mt-3 text-sm font-semibold capitalize">{user?.name}</p>
        <p className="text-sm text-white/65">{user?.role}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ mobile = false }) {
  const { closeSidebar, isSidebarOpen } = useAppShell()

  useBodyScrollLock(mobile && isSidebarOpen)

  if (!mobile) {
    return (
      <aside className="hidden min-h-screen w-[290px] shrink-0 lg:block">
        <SidebarContent />
      </aside>
    )
  }

  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 lg:hidden',
        isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!isSidebarOpen}
    >
      <div
        className={classNames(
          'absolute inset-0 bg-slate-950/50 transition-opacity duration-300',
          isSidebarOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={closeSidebar}
      />
      <div
        className={classNames(
          'absolute left-0 top-0 h-full w-full max-w-[290px] transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white"
          aria-label="Close dashboard menu"
        >
          <X className="size-4" />
        </button>
        <SidebarContent />
      </div>
    </div>
  )
}

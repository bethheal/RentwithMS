import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'
import { useAppShell } from '../../context/AppShellContext.jsx'
import { marketingNavigation } from '../../data/navigation.js'
import { classNames } from '../../utils/classNames.js'
import BrandMark from '../common/BrandMark.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'

export default function MobileSidebar() {
  const { closeSidebar, isSidebarOpen } = useAppShell()
  useBodyScrollLock(isSidebarOpen)

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
          'absolute inset-0 bg-slate-950/45 transition-opacity duration-300',
          isSidebarOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={closeSidebar}
      />

      <aside
        className={classNames(
          'absolute right-0 top-0 flex h-full w-full max-w-xs flex-col gap-8 bg-brand-950 px-6 py-6 text-white transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <BrandMark theme="light" />
          <button
            type="button"
            onClick={closeSidebar}
            className="grid size-11 place-items-center rounded-full border border-white/15"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {[...marketingNavigation.left, ...marketingNavigation.right].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeSidebar}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <PrimaryButton to="/login" variant="light" onClick={closeSidebar}>
            Login
          </PrimaryButton>
          <PrimaryButton to="/signup" variant="light" onClick={closeSidebar}>
            Signup
          </PrimaryButton>
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className="text-center text-sm font-medium text-white/70 transition hover:text-white"
          >
            Open demo dashboard
          </Link>
        </div>
      </aside>
    </div>
  )
}

import { Menu } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import Container from '../components/common/Container.jsx'
import Sidebar from '../components/navigation/Sidebar.jsx'
import { useAppShell } from '../context/AppShellContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardLayout() {
  const { openSidebar } = useAppShell()
  const { user } = useAuth()
  const isTenant = user?.role?.toLowerCase() === 'tenant'
  const isLandlord = user?.role?.toLowerCase() === 'landlord'

  if (isTenant || isLandlord) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Sidebar mobile />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <Container className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openSidebar}
                className="grid size-11 place-items-center rounded-full border border-slate-200 lg:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Dashboard Layout
                </p>
                <h1 className="font-display text-2xl font-bold tracking-[-0.05em] text-slate-900">
                  Welcome back, {user?.name}
                </h1>
              </div>
            </div>

            <Link
              to="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              Back to website
            </Link>
          </Container>
        </header>

        <main className="flex-1 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

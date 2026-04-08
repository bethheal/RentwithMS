import { ArrowUpRight, CircleCheckBig } from 'lucide-react'
import LandlordDashboardView from '../../components/dashboard/LandlordDashboardView.jsx'
import TenantDashboardView from '../../components/dashboard/TenantDashboardView.jsx'
import Container from '../../components/common/Container.jsx'
import Reveal from '../../components/common/Reveal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { dashboardResponse } from '../../data/mockApi/dashboard.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const isTenant = user?.role?.toLowerCase() === 'tenant'
  const isLandlord = user?.role?.toLowerCase() === 'landlord'
  const { activity, stats, tasks } = dashboardResponse.data

  if (isTenant) {
    return <TenantDashboardView />
  }

  if (isLandlord) {
    return <LandlordDashboardView />
  }

  return (
    <Container className="space-y-8">
      <Reveal className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <article
            key={stat.id}
            className={`rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur-sm ${index === 1 ? 'bg-brand-900 text-white' : ''}`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.26em] ${
                index === 1 ? 'text-brand-100' : 'text-slate-500'
              }`}
            >
              {stat.label}
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <h2
                className={`font-display text-4xl font-bold tracking-[-0.06em] ${
                  index === 1 ? 'text-white' : 'text-slate-900'
                }`}
              >
                {stat.value}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  index === 1
                    ? 'bg-white/10 text-white'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </article>
        ))}
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Recent Activity
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-slate-900">
                Daily workflow pulse
              </h2>
            </div>
            <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              {user?.role}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {activity.map((item) => (
              <div
                key={item}
                className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-full bg-emerald-50 p-2 text-emerald-700">
                    <CircleCheckBig className="size-4" />
                  </span>
                  <p className="text-sm leading-7 text-slate-700">{item}</p>
                </div>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-slate-400" />
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="space-y-6" delay={120}>
          <article className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              Today
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-slate-900">
              Priorities for {user?.name}
            </h2>
            <ul className="mt-6 space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4"
                >
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{task.status}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="overflow-hidden rounded-[2rem] bg-brand-900 p-6 text-white shadow-hero">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-100">
              Frontend-ready shell
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.05em]">
              Add charts, tables, and API hooks next.
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-100">
              The dashboard route is intentionally modular, so adding analytics,
              pagination, filters, and request layers later will stay manageable.
            </p>
          </article>
        </Reveal>
      </div>
    </Container>
  )
}

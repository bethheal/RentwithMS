import {
  Activity,
  ArrowRight,
  BarChart3,
  FolderOpen,
  Globe2,
  MoreHorizontal,
  Rocket,
  Search,
  Settings,
  Star,
  Waves,
} from 'lucide-react'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'
import { classNames } from '../../utils/classNames.js'

const navigationIconMap = {
  projects: FolderOpen,
  deployments: Rocket,
  activity: Activity,
  domains: Globe2,
  usage: BarChart3,
  settings: Settings,
}

const statusToneMap = {
  active: 'bg-[#4ADE80]',
  pending: 'bg-slate-500',
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase()
}

export default function CtaSection({ cta }) {
  return (
    <section id="cta" className="py-14 sm:py-16 lg:py-20">
      <Container className="!max-w-none !px-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-[#DCE7FF]/16 bg-[linear-gradient(135deg,#0C2C86_0%,#18399F_52%,#15338D_100%)] px-6 py-8 text-white shadow-[0_28px_70px_rgba(12,44,134,0.28)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_82%,rgba(79,168,248,0.22),transparent_30%),radial-gradient(circle_at_18%_70%,rgba(220,231,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]"
              aria-hidden="true"
            />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,1.08fr)] lg:items-center lg:gap-12">
              <Reveal className="max-w-2xl space-y-7 sm:space-y-8">
                <h2 className="max-w-2xl text-[2.6rem] font-bold leading-[0.98] tracking-[-0.07em] text-white sm:text-[3.2rem] lg:text-[3.7rem]">
                  {cta.title}
                </h2>

                <p className="max-w-xl text-base leading-8 text-[#E8EEFF] sm:text-[1.15rem]">
                  {cta.description}
                </p>

                <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-7">
                  <PrimaryButton
                    to={cta.primaryAction?.to}
                    href={cta.primaryAction?.href}
                    variant="ghost"
                    size="lg"
                    className="border border-white/10 bg-white px-8 py-4 text-[0.85rem] tracking-[0.04em] text-[#18399F] shadow-[0_16px_34px_rgba(220,231,255,0.18)] hover:bg-[#E8EEFF] hover:text-[#15338D]"
                  >
                    {cta.primaryAction?.label ?? 'Get started'}
                  </PrimaryButton>

                  <a
                    href={cta.secondaryAction?.href ?? '#features'}
                    className="inline-flex items-center gap-2 text-[1.05rem] font-semibold text-white transition-colors duration-300 hover:text-[#DCE7FF]"
                  >
                    <span>{cta.secondaryAction?.label ?? 'Learn more'}</span>
                    <ArrowRight className="size-5" />
                  </a>
                </div>
              </Reveal>

              <Reveal className="lg:justify-self-end" delay={120}>
                <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE7FF]/12 bg-[#102E82] shadow-[0_28px_60px_rgba(12,44,134,0.28)]">
                  <div className="flex items-center justify-between border-b border-[#DCE7FF]/10 bg-[#15378F] px-5 py-5">
                    <div className="flex items-center gap-3 text-[#7ABEFF]">
                      <Waves className="size-6" />
                    </div>
                    <MoreHorizontal className="size-5 text-[#B7C9FF]/70" />
                  </div>

                  <div className="grid min-h-[32rem] md:grid-cols-[14rem_minmax(0,1fr)]">
                    <div className="border-b border-[#DCE7FF]/10 bg-[#12327F] px-5 py-6 md:border-b-0 md:border-r md:border-[#DCE7FF]/10">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B7C9FF]/72">
                        {cta.preview?.navigationLabel ?? 'Navigation'}
                      </p>

                      <nav className="mt-5 space-y-1">
                        {(cta.preview?.navigationItems ?? []).map((item) => {
                          const Icon =
                            navigationIconMap[normalizeKey(item.icon ?? item.label)] ?? FolderOpen

                          return (
                            <a
                              key={item.label}
                              href={item.href ?? '#contact'}
                              className={classNames(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300',
                                item.active
                                  ? 'bg-[#DCE7FF]/12 text-white'
                                  : 'text-[#DCE7FF]/72 hover:bg-[#DCE7FF]/8 hover:text-white',
                              )}
                            >
                              <Icon className="size-4" />
                              <span>{item.label}</span>
                            </a>
                          )
                        })}
                      </nav>

                      <div className="mt-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B7C9FF]/72">
                          {cta.preview?.teamsLabel ?? 'Your teams'}
                        </p>

                        <div className="mt-4 space-y-3">
                          {(cta.preview?.teams ?? []).map((team, index) => (
                            <div key={team} className="flex items-center gap-3 text-sm text-[#DCE7FF]/72">
                              <span className="grid size-7 place-items-center rounded-full border border-[#DCE7FF]/10 bg-white/6 text-xs font-semibold uppercase text-white/90">
                                {team
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')}
                                {index + 1}
                              </span>
                              <span>{team}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#173A97]">
                      <div className="border-b border-[#DCE7FF]/10 px-5 py-5">
                        <label className="relative block">
                          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#B7C9FF]/68" />
                          <input
                            type="text"
                            value=""
                            readOnly
                            placeholder={cta.preview?.searchPlaceholder ?? 'Search projects...'}
                            className="h-11 w-full rounded-xl border border-[#DCE7FF]/10 bg-white/8 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#DCE7FF]/48"
                          />
                        </label>
                      </div>

                      <div className="px-5 py-6">
                        <h3 className="text-lg font-semibold text-white">
                          {cta.preview?.listTitle ?? 'All projects'}
                        </h3>

                        <div className="mt-5 space-y-2">
                          {(cta.preview?.projects ?? []).map((project) => (
                            <div
                              key={`${project.team}-${project.name}`}
                              className="rounded-[1.1rem] border border-[#DCE7FF]/10 bg-[#102E82]/34 px-4 py-4 transition-colors duration-300 hover:bg-[#0C2C86]/46"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={classNames(
                                    'size-2.5 rounded-full',
                                    statusToneMap[project.status] ?? statusToneMap.pending,
                                  )}
                                  aria-hidden="true"
                                />
                                <p className="text-sm font-semibold text-white">
                                  <span className="text-slate-200">{project.team}</span>
                                  <span className="mx-2 text-slate-500">/</span>
                                  <span>{project.name}</span>
                                  {project.highlighted ? (
                                    <Star className="ml-2 inline size-3.5 fill-[#FACC15] text-[#FACC15]" />
                                  ) : null}
                                </p>
                              </div>

                              <p className="mt-3 text-xs leading-6 text-[#DCE7FF]/48">
                                {project.meta}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

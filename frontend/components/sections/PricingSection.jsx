import { useState } from 'react'
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
import PricingPlanCard from '../cards/PricingPlanCard.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
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
  pending: 'bg-slate-400',
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase()
}

export default function PricingSection({ pricing, cta }) {
  const [billingMode, setBillingMode] = useState('monthly')
  const isYearly = billingMode === 'yearly'

  return (
    <section id="pricing" className="py-14 sm:py-16 lg:py-20">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[2.6rem] border border-[#DCE7FF] bg-[linear-gradient(180deg,#F7FAFF_0%,#FFFFFF_42%,#F3F7FF_100%)] px-5 py-10 shadow-[0_28px_70px_rgba(24,57,159,0.12)] sm:px-8 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,rgba(24,57,159,0.1),transparent_60%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_center,rgba(79,168,248,0.12),transparent_60%)]"
            aria-hidden="true"
          />

          <Reveal className="relative z-10">
            <SectionHeading
              align="center"
              eyebrow={pricing.eyebrow}
              eyebrowVariant="underline"
              title={pricing.title}
              description={pricing.description}
              className="mx-auto max-w-3xl"
            />
          </Reveal>

          <Reveal
            delay={70}
            className="relative z-10 mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
           

            <div className="flex w-fit items-center gap-3 rounded-full border border-[#DCE7FF] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(24,57,159,0.06)]">
              <button
                type="button"
                onClick={() => setBillingMode('monthly')}
                className={classNames(
                  'text-sm font-semibold transition-colors duration-300',
                  !isYearly ? 'text-[#18399F]' : 'text-slate-400',
                )}
              >
                {pricing.monthlyLabel ?? 'Monthly'}
              </button>
              <button
                type="button"
                aria-pressed={isYearly}
                onClick={() =>
                  setBillingMode((current) =>
                    current === 'monthly' ? 'yearly' : 'monthly',
                  )
                }
                className={classNames(
                  'flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300',
                  isYearly ? 'bg-[#18399F]' : 'bg-[#4FA8F8]',
                )}
              >
                <span
                  className={classNames(
                    'size-6 rounded-full bg-[#FFD9C8] transition-transform duration-300',
                    isYearly ? 'translate-x-6' : 'translate-x-0',
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('yearly')}
                className={classNames(
                  'text-sm font-semibold transition-colors duration-300',
                  isYearly ? 'text-[#18399F]' : 'text-slate-400',
                )}
              >
                {pricing.yearlyLabel ?? 'Yearly'}
              </button>
            </div>
          </Reveal>

          <Reveal delay={100} className="relative z-10 mt-12">
            <div className="grid gap-8 xl:grid-cols-3 xl:items-end">
              {pricing.plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={classNames(
                    'w-full',
                    plan.featured
                      ? 'xl:-translate-y-8'
                      : index === 0
                        ? 'xl:translate-y-2'
                        : 'xl:translate-y-4',
                  )}
                >
                  <PricingPlanCard plan={plan} billingMode={billingMode} />
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={170} className="relative z-10 mt-14">
            <div className="relative overflow-hidden rounded-[2.1rem] border border-[#DCE7FF]/16 bg-[linear-gradient(135deg,#0C2C86_0%,#18399F_54%,#15338D_100%)] px-6 py-8 text-white shadow-[0_28px_70px_rgba(12,44,134,0.28)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_82%,rgba(79,168,248,0.22),transparent_30%),radial-gradient(circle_at_18%_70%,rgba(220,231,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]"
                aria-hidden="true"
              />

              <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,1.12fr)] lg:items-center lg:gap-12">
                <div className="max-w-2xl space-y-7 sm:space-y-8">
                  <h3 className="max-w-2xl text-[2.35rem] font-bold leading-[1] tracking-[-0.06em] text-white sm:text-[2.9rem] lg:text-[3.25rem]">
                    {cta?.title}
                  </h3>

                  <p className="max-w-xl text-base leading-8 text-[#E8EEFF] sm:text-[1.08rem]">
                    {cta?.description}
                  </p>

                  <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-7">
                    <PrimaryButton
                      to={cta?.primaryAction?.to}
                      href={cta?.primaryAction?.href}
                      variant="ghost"
                      size="lg"
                      className="border border-white/10 bg-white px-8 py-4 text-[0.85rem] tracking-[0.04em] text-[#18399F] shadow-[0_16px_34px_rgba(220,231,255,0.18)] hover:bg-[#E8EEFF] hover:text-[#15338D]"
                    >
                      {cta?.primaryAction?.label ?? 'Get started'}
                    </PrimaryButton>

                    <a
                      href={cta?.secondaryAction?.href ?? '#features'}
                      className="inline-flex items-center gap-2 text-[1.05rem] font-semibold text-white transition-colors duration-300 hover:text-[#DCE7FF]"
                    >
                      <span>{cta?.secondaryAction?.label ?? 'Learn more'}</span>
                      <ArrowRight className="size-5" />
                    </a>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE7FF]/12 bg-[#102E82] shadow-[0_28px_60px_rgba(12,44,134,0.28)]">
                  <div className="flex items-center justify-between border-b border-[#DCE7FF]/10 bg-[#15378F] px-5 py-5">
                    <div className="flex items-center gap-3 text-[#7ABEFF]">
                      <Waves className="size-6" />
                    </div>
                    <MoreHorizontal className="size-5 text-[#B7C9FF]/70" />
                  </div>

                  <div className="grid min-h-[30rem] md:grid-cols-[14rem_minmax(0,1fr)]">
                    <div className="border-b border-[#DCE7FF]/10 bg-[#12327F] px-5 py-6 md:border-b-0 md:border-r md:border-[#DCE7FF]/10">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B7C9FF]/72">
                        {cta?.preview?.navigationLabel ?? 'Navigation'}
                      </p>

                      <nav className="mt-5 space-y-1">
                        {(cta?.preview?.navigationItems ?? []).map((item) => {
                          const Icon =
                            navigationIconMap[normalizeKey(item.icon ?? item.label)] ??
                            FolderOpen

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
                          {cta?.preview?.teamsLabel ?? 'Your teams'}
                        </p>

                        <div className="mt-4 space-y-3">
                          {(cta?.preview?.teams ?? []).map((team, index) => (
                            <div
                              key={team}
                              className="flex items-center gap-3 text-sm text-[#DCE7FF]/72"
                            >
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
                            placeholder={cta?.preview?.searchPlaceholder ?? 'Search projects...'}
                            className="h-11 w-full rounded-xl border border-[#DCE7FF]/10 bg-white/8 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#DCE7FF]/48"
                          />
                        </label>
                      </div>

                      <div className="px-5 py-6">
                        <h3 className="text-lg font-semibold text-white">
                          {cta?.preview?.listTitle ?? 'All workspaces'}
                        </h3>

                        <div className="mt-5 space-y-2">
                          {(cta?.preview?.projects ?? []).map((project) => (
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
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

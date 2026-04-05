import { Quote } from 'lucide-react'
import { useState } from 'react'
import aboutBackground from '../../assets/aboutbg.png'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'
import { classNames } from '../../utils/classNames.js'

export default function AboutMissionSection({ mission }) {
  const [activeTab, setActiveTab] = useState(0)

  const currentTab = mission.tabs[activeTab]
  const summaryLines = [currentTab.description, ...currentTab.points].slice(0, 3)
  const missionTab = mission.tabs.find((tab) => tab.id === 'mission') ?? mission.tabs[0]
  const visionTab = mission.tabs.find((tab) => tab.id === 'vision') ?? mission.tabs[1]

  return (
    <section id="about" className="bg-white py-1 sm:py-10">
      <Container className="!max-w-none !px-0">
        <div className="relative bg-white px-5 py-9 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <img
            src={aboutBackground}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[1] brightness-[0.84]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-white/72"
            aria-hidden="true"
          />

          <Reveal className="relative z-10">
            <div
              className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 lg:gap-12"
              role="tablist"
              aria-label="About section tabs"
            >
              {mission.tabs.map((tab, index) => {
                const isActive = index === activeTab

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`about-panel-${tab.id}`}
                    id={`about-tab-${tab.id}`}
                    onClick={() => setActiveTab(index)}
                    className="group relative cursor-pointer pb-2 font-sans text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 transition-colors duration-300 hover:text-[#0C2C86] sm:text-sm"
                  >
                    <span
                      className={classNames(
                        'transition-colors duration-300',
                        isActive ? 'text-[#0C2C86]' : '',
                      )}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={classNames(
                        'absolute bottom-0 left-0 h-0.5 w-full origin-center rounded-full bg-[#0C2C86] transition-all duration-300',
                        isActive
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70',
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </Reveal>

          <Reveal className="relative z-10 mt-8 sm:mt-10" delay={80}>
            <div className="max-w-sm space-y-3 text-[#0C2C86]">
              <Quote className="size-8 fill-current stroke-0" />
              <div className="space-y-1 text-base font-extrabold italic leading-tight sm:text-[1.1rem]">
                {missionTab?.title ? <p>{missionTab.title}</p> : null}
                {visionTab?.title ? <p>{visionTab.title}</p> : null}
              </div>
            </div>
          </Reveal>

          <Reveal
            as="div"
            className="relative z-10 mt-10"
            delay={140}
          >
            <div
              key={currentTab.id}
              id={`about-panel-${currentTab.id}`}
              role="tabpanel"
              aria-labelledby={`about-tab-${currentTab.id}`}
              className="mx-auto max-w-4xl motion-safe:animate-[about-panel-switch_420ms_ease-out]"
            >
              <div className="space-y-7 sm:space-y-8">
                {summaryLines.map((line, index) => (
                  <div
                    key={`${currentTab.id}-${index}`}
                    className={classNames(
                      'flex justify-center',
                      index === 0 ? 'items-start gap-5' : '',
                    )}
                  >
                    {index === 0 ? (
                      <span
                        className="mt-3 hidden h-1 w-24 shrink-0 rounded-full bg-[#0C2C86] sm:block"
                        aria-hidden="true"
                      />
                    ) : null}

                    <p
                      className={classNames(
                        'max-w-3xl text-center text-base font-semibold italic leading-tight text-[#5E5A5A] sm:text-[1.1rem]',
                        index === 0 ? 'sm:text-left' : '',
                      )}
                    >
                      {line}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <PrimaryButton
                  href={mission.cta.href}
                  variant="outline"
                  className="cursor-pointer border-[#0C2C86] px-9 py-3 font-extrabold tracking-normal text-[#0C2C86] hover:border-[#0C2C86] hover:bg-[#0C2C86] hover:text-white"
                >
                  {mission.cta.label}
                </PrimaryButton>
              </div>

              <div className="mt-12 flex items-center justify-center gap-14 sm:gap-24">
                {mission.tabs.map((tab, index) => {
                  const isActive = index === activeTab

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-label={`Show ${tab.label}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveTab(index)}
                      className="cursor-pointer p-1"
                    >
                      <span
                        className={classNames(
                          'block size-2.5 rounded-full transition-colors duration-300',
                          isActive ? 'bg-[#123792]' : 'bg-slate-300',
                        )}
                      />
                    </button>
                  )
                })}
              </div>

              <div className="mt-12 h-px w-full bg-slate-300" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

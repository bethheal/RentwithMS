import { Search } from 'lucide-react'
import heroImage from '../../assets/hero.png'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'

export default function HeroSection({ hero }) {
  const heroTitleChipClassName =
    'inline-flex items-center bg-white px-2 py-2 font-[var(--font-hero)] text-[clamp(1.95rem,4.35vw,4.15rem)] font-bold uppercase leading-[0.88] tracking-[-0.08em] text-[#1F2C5C] shadow-[8px_8px_0_rgba(15,23,42,0.08)] sm:px-3 sm:py-2.5'
  const heroKickerClassName =
    'inline-flex items-center text-lg font-semibold italic tracking-[-0.06em] text-white sm:text-2xl lg:text-[1.9rem]'
  const heroAmpersandClassName =
    'inline-flex items-center bg-transparent px-0 py-0 font-[var(--font-hero)] text-[clamp(2.2rem,4.6vw,4.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.08em] text-white shadow-none'

  return (
    <section id="home" className="py-0">
      <Container className="!max-w-none !px-0">
        <div className="relative min-h-[32rem] overflow-hidden bg-brand-900 text-white sm:min-h-[38rem] lg:min-h-[43rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(127,157,253,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_22%)]" />
          <div className="absolute bottom-0 right-0 z-10 w-full max-w-[76rem]">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent sm:w-40 lg:w-56" />
            <img
              src={heroImage}
              alt="Landlord and tenant reviewing a rental property together"
              className="ml-auto w-full object-contain object-bottom opacity-70"
            />
          </div>

          <Reveal className="relative z-20 flex min-h-128 items-center px-4 py-14 sm:min-h-152 sm:px-6 sm:py-20 lg:min-h-172 lg:px-10 lg:py-20">
            <div className="max-w-196">
              <div className="space-y-3 sm:space-y-4">
                {hero.titleLines.map((line, lineIndex) => (
                  <div
                    key={line.join('-')}
                    className={`flex items-center gap-2 sm:gap-3 ${
                      lineIndex === 0 ? 'flex-wrap sm:flex-nowrap' : 'flex-wrap'
                    }`}
                  >
                    {line.map((word) => {
                      if (word === 'For') {
                        return (
                          <span key={word} className={heroKickerClassName}>
                            {word}
                          </span>
                        )
                      }

                      if (word === '&') {
                        return (
                          <span key={word} className={heroAmpersandClassName}>
                            {word}
                          </span>
                        )
                      }

                      return (
                        <span key={word} className={heroTitleChipClassName}>
                          {word}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>

              <p className="mt-5 max-w-[31rem] text-base leading-8 text-white/90 sm:mt-7 sm:text-lg">
                {hero.description}
              </p>

              <div className="mt-12 flex max-w-md flex-col gap-4 sm:mt-16 sm:max-w-none sm:flex-row">
                <PrimaryButton
                  href={hero.primaryAction.href}
                  icon={Search}
                  showIcon
                  size="xl"
                  variant="light"
                  className="w-full min-w-0 justify-center border-slate-400 p-3 font-extrabold text-[#092986] sm:w-auto sm:min-w-[11.5rem]"
                >
                  {hero.primaryAction.label}
                </PrimaryButton>
                <PrimaryButton
                  to={hero.secondaryAction.to}
                  size="xl"
                  variant="light"
                  className="w-full min-w-0 justify-center border-slate-400 px-7 text-[#092986] sm:w-auto sm:min-w-[11.5rem]"
                >
                  {hero.secondaryAction.label}
                </PrimaryButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

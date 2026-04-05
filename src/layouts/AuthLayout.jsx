import { Outlet } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark.jsx'
import Container from '../components/common/Container.jsx'
import Reveal from '../components/common/Reveal.jsx'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-12">
      <Container>
        <div className="relative overflow-hidden rounded-[2.25rem] border border-brand-900/10 bg-brand-900 text-white">
          <div className="grid min-h-[calc(100vh-4rem)] items-stretch lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal className="hidden flex-col justify-between px-8 py-10 lg:flex">
              <BrandMark theme="light" />
              <div className="max-w-md space-y-5">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white">
                  Auth Layout
                </span>
                <h1 className="font-display text-5xl font-bold tracking-[-0.06em]">
                  Secure entry points for your rental product.
                </h1>
                <p className="text-lg leading-8 text-brand-100">
                  This layout keeps auth flows visually separate from the marketing
                  site while reusing the same design language.
                </p>
              </div>
            </Reveal>

            <div className="bg-white px-6 py-8 text-slate-900 sm:px-8 lg:px-10 lg:py-12">
              <Outlet />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

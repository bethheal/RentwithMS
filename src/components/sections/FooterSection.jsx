import { Globe, Mail, Users } from 'lucide-react'
import { useState } from 'react'
import BrandMark from '../common/BrandMark.jsx'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'

const socialMap = {
  facebook: Users,
  instagram: Globe,
  linkedin: Mail,
}

export default function FooterSection({ footer }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitted(Boolean(email.trim()))
    setEmail('')
  }

  return (
    <footer id="contact" className="bg-brand-900 py-0 text-white">
      <Container>
        <div className="overflow-hidden rounded-[2.25rem] bg-white text-slate-900 shadow-hero">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
            <div className="rounded-[2rem] bg-brand-900 px-6 py-8 text-white">
              <BrandMark theme="light" />
              <p className="mt-6 max-w-sm text-sm leading-7 text-brand-100 sm:text-base">
                {footer.tagline}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-8 sm:grid-cols-2">
                {footer.linkGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {group.title}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {group.links.map((link) => (
                        <li key={link}>
                          <a
                            href="#home"
                            className="text-sm font-medium text-slate-700 transition hover:text-brand-700"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Subscribe
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        setIsSubmitted(false)
                      }}
                      placeholder={footer.newsletterPlaceholder}
                      className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                  <PrimaryButton type="submit" variant="brand">
                    Subscribe
                  </PrimaryButton>
                  <p className="text-xs leading-6 text-slate-500">
                    {isSubmitted
                      ? 'Thanks. Your email has been captured in local component state.'
                      : 'Use controlled inputs now; consider react-hook-form once the form surface grows.'}
                  </p>
                </form>

                <div className="mt-8 flex items-center gap-3">
                  {footer.socialLinks.map((item) => {
                    const Icon = socialMap[item]

                    return (
                      <a
                        key={item}
                        href="#contact"
                        className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                        aria-label={item}
                      >
                        <Icon className="size-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          <div className="flex flex-col gap-4 px-6 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p>{footer.brandName} (c) 2026. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {footer.legalLinks.map((link) => (
                <a key={link} href="#contact" className="transition hover:text-brand-700">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}

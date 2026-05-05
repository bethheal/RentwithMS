import { useState } from 'react'
import Container from '../common/Container.jsx'
import { showErrorToast, showSuccessToast } from '../../utils/toast.js'

function FacebookIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.4c0-.9.3-1.5 1.5-1.5H16V5.2c-.2 0-.9-.1-1.8-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.4v7h3.1Z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.25" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.9" r="1.1" fill="currentColor" />
    </svg>
  )
}

function YoutubeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M20.5 8.3a2.6 2.6 0 0 0-1.8-1.8C17.2 6 12 6 12 6s-5.2 0-6.7.5A2.6 2.6 0 0 0 3.5 8.3 27.5 27.5 0 0 0 3 12a27.5 27.5 0 0 0 .5 3.7 2.6 2.6 0 0 0 1.8 1.8C6.8 18 12 18 12 18s5.2 0 6.7-.5a2.6 2.6 0 0 0 1.8-1.8A27.5 27.5 0 0 0 21 12a27.5 27.5 0 0 0-.5-3.7ZM10.2 14.9v-5.8l5 2.9-5 2.9Z" />
    </svg>
  )
}

const socialMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
}

const footerHrefMap = {
  Home: '#home',
  About: '#about',
  "FAQ's": '#faq',
  FAQs: '#faq',
  Blog: '#blog',
}

export default function FooterSection({ footer }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setIsSubmitted(false)
      showErrorToast('Enter your email address before subscribing.')
      return
    }

    setIsSubmitted(true)
    showSuccessToast('Thanks for subscribing. We will keep you posted.')
    setEmail('')
  }

  const getLinkHref = (label) => footerHrefMap[label] ?? '#contact'

  return (
    <footer id="contact" className="bg-[#18399F] py-10  text-white">
      <Container className="!max-w-none !px-0">
        <div className="relative overflow-hidden bg-[#18399F] px-4 sm:px-5 lg:px-4">
          <div className="relative overflow-hidden rounded-[0_2.6rem_2.6rem_2.6rem] bg-white text-slate-900 shadow-[0_28px_70px_rgba(8,23,77,0.28)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(24,57,159,0.08),transparent_32%),linear-gradient(140deg,rgba(255,255,255,1),rgba(248,250,255,0.96))]"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 px-6 pb-8 pt-6 sm:px-8 sm:pb-9 sm:pt-7 lg:grid-cols-[12.5rem_minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:pb-10 lg:pt-0">
              <div className="-ml-6 -mt-6 flex h-[10rem] w-[12rem] items-center justify-center overflow-hidden rounded-br-[3.4rem] rounded-tl-[1.7rem] bg-[#18399F]  sm:-ml-8 sm:-mt-7 sm:h-[10.8rem] sm:w-[12.8rem] lg:-ml-12 lg:h-[11rem] lg:w-[13.2rem]">
                <div/>
                <span className="relative font-sans text-[2.05rem] font-extrabold uppercase tracking-[-0.05em] text-white sm:text-[2.3rem]">
                  {footer.brandName}
                </span>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:pt-10">
                {footer.linkGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-base font-semibold text-slate-900">
                      {group.title}
                    </h3>
                    <ul className="mt-5 space-y-3.5">
                      {group.links.map((link) => (
                        <li key={link}>
                          <a
                            href={getLinkHref(link)}
                            className="text-[1.02rem] font-medium text-slate-700 transition-colors duration-300 hover:text-[#18399F]"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="lg:pt-10">
                <h3 className="text-base font-semibold text-slate-900">
                  Subscribe
                </h3>
                <p className="mt-5 max-w-md text-[1.02rem] leading-7 text-slate-700">
                  {footer.subscriptionText ?? footer.tagline}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-5 flex flex-col gap-3 sm:max-w-[26rem] sm:flex-row sm:items-center"
                >
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        setIsSubmitted(false)
                      }}
                      placeholder={footer.newsletterPlaceholder ?? 'Enter your email'}
                      className="h-12 w-full rounded-full border border-[#DCE4FF] bg-[#E8EEFF] px-6 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#9FB7FF] focus:bg-white focus:ring-4 focus:ring-[#DCE4FF]"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#18399F] px-8 text-base font-semibold text-white transition-colors duration-300 hover:bg-[#102E82]"
                  >
                    Subscribe
                  </button>
                </form>

                {isSubmitted ? (
                  <p className="mt-3 text-sm text-[#18399F]">
                    Thanks for subscribing.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="relative mx-6 h-px bg-slate-200 sm:mx-8 lg:mx-12" />

            <div className="relative px-6 pb-4 pt-6 sm:px-8 lg:px-12">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-semibold uppercase tracking-[-0.04em] text-slate-900">
                  {footer.brandName}
                </p>

                <div className="flex items-center gap-4">
                  {footer.socialLinks.map((item) => {
                    const Icon = socialMap[item]

                    if (!Icon) {
                      return null
                    }

                    return (
                      <a
                        key={item}
                        href="#contact"
                        className="text-[#1D4ED8] transition-transform duration-300 hover:-translate-y-0.5 hover:text-[#18399F]"
                        aria-label={item}
                      >
                        <Icon className="size-5" />
                      </a>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {footer.legalLinks.map((link) => (
                    <a
                      key={link}
                      href={getLinkHref(link)}
                      className="transition-colors duration-300 hover:text-[#18399F]"
                    >
                      {link}
                    </a>
                  ))}
                </div>

                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}

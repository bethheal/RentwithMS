import { useState } from 'react'
import bookPattern from '../../assets/illustrations/book-pattern.svg'
import { classNames } from '../../utils/classNames.js'
import BlogListCard from '../cards/BlogListCard.jsx'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

function normalizeFilterId(value, index) {
  const normalizedValue = String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return normalizedValue || `filter-${index + 1}`
}

export default function BlogSection({ blog }) {
  const filters = (blog.filters ?? ['Our Blogs', 'Videos', 'Podcasts']).map(
    (filter, index) => {
      if (typeof filter === 'string') {
        return {
          id: normalizeFilterId(filter, index),
          label: filter,
          posts: index === 0 ? blog.posts ?? [] : [],
        }
      }

      return {
        ...filter,
        id: normalizeFilterId(filter.id ?? filter.label, index),
        label: filter.label ?? `Filter ${index + 1}`,
        posts: filter.posts ?? [],
      }
    },
  )

  const initialFilterId =
    filters.find(
      (filter) =>
        filter.id === normalizeFilterId(blog.activeFilter, 0) ||
        filter.label === blog.activeFilter,
    )?.id ??
    filters[0]?.id ??
    ''
  const [activeFilterId, setActiveFilterId] = useState(initialFilterId)

  const activeFilter =
    filters.find((filter) => filter.id === activeFilterId) ?? filters[0]
  const visiblePosts = activeFilter?.posts ?? blog.posts ?? []
  const activeContentType = activeFilter?.contentType ?? 'blog'
  const activeActionLabel = activeFilter?.actionLabel

  if (!activeFilter) {
    return null
  }

  return (
    <section id="blog" className="py-14 sm:py-16 lg:py-20">
      <Container className="!max-w-none !px-0">
        <div className="relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <img
            src={bookPattern}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.24] brightness-[0.94]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]"
            aria-hidden="true"
          />

          <Reveal className="relative z-10">
            <SectionHeading align="center" eyebrow={blog.eyebrow} eyebrowVariant="underline" />
          </Reveal>

          <div className="relative z-10 mt-10 grid gap-10 lg:grid-cols-[minmax(220px,0.38fr)_minmax(0,0.62fr)] lg:gap-12">
            <Reveal className="space-y-4 lg:pt-6" delay={70}>
              <h2 className="font-sans text-[2.25rem] font-bold uppercase tracking-[-0.06em] text-[#18399F] sm:text-[2.7rem] lg:text-[3.15rem]">
                {blog.title}
              </h2>
              <p className="max-w-xs text-sm leading-7 text-slate-500">
                {blog.description}
              </p>
            </Reveal>

            <Reveal className="space-y-10 sm:space-y-12" delay={120}>
              <div aria-live="polite" className="space-y-10 sm:space-y-12">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <BlogListCard
                      key={post.id}
                      post={post}
                      contentType={post.contentType ?? activeContentType}
                      actionLabel={post.actionLabel ?? activeActionLabel}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300/80 bg-white/70 px-5 py-6 text-sm leading-7 text-slate-500">
                    New stories for {activeFilter.label.toLowerCase()} will
                    appear here soon.
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal
            className="relative z-10 mt-12 flex flex-col gap-6 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between"
            delay={180}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {filters.map((filter, index) => {
                const isActive = filter.id === activeFilter.id

                return (
                  <div key={filter.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveFilterId(filter.id)}
                      className={classNames(
                        'rounded-full px-1 py-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18399F]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]',
                        isActive
                          ? 'font-semibold text-slate-900 underline decoration-slate-900 underline-offset-4'
                          : 'text-slate-500 hover:text-[#18399F]',
                      )}
                    >
                      {filter.label}
                    </button>
                    {index < filters.length - 1 ? (
                      <span className="size-1.5 rounded-full bg-[#18399F]" aria-hidden="true" />
                    ) : null}
                  </div>
                )
              })}
            </div>

            <PrimaryButton
              href={blog.cta?.href ?? '#blog'}
              variant="light"
              className="w-full border-0 bg-white/90 px-7 py-3 text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.08)] backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_22px_34px_rgba(15,23,42,0.12)] sm:w-auto"
            >
              {blog.cta?.label ?? 'Explore More'}
            </PrimaryButton>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

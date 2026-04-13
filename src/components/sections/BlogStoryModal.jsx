import { useEffect } from 'react'
import { Clock3, Tag, X } from 'lucide-react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'

const contentTypeLabelMap = {
  blog: 'Article',
  podcast: 'Podcast',
  video: 'Video',
}

export default function BlogStoryModal({ post, onClose }) {
  const isOpen = Boolean(post)

  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!post) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#09173F]/65 backdrop-blur-[3px]"
        aria-label="Close full story modal"
      />

      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={`story-title-${post.id}`}
        className="relative z-10 flex max-h-[92vh] w-full max-w-[58rem] flex-col overflow-hidden rounded-[2.2rem] border border-white/20 bg-white shadow-[0_30px_80px_rgba(7,22,63,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] px-5 py-5 sm:px-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#18399F]">
              <span className="rounded-full bg-[#EAF0FF] px-3 py-1.5">
                {contentTypeLabelMap[post.contentType] ?? 'Story'}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Tag className="size-3.5" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock3 className="size-3.5" />
                {post.readingTime}
              </span>
            </div>

            <div>
              <h2
                id={`story-title-${post.id}`}
                className="max-w-[42rem] text-2xl font-bold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]"
              >
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{post.date}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close story"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.55fr)]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-[0_18px_34px_rgba(15,23,42,0.1)]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.imageAlt ?? post.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div
                    className="aspect-[16/10] w-full bg-[linear-gradient(135deg,#E2E8F0,#CBD5E1)]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="rounded-[1.6rem] bg-[#F8FAFF] px-5 py-5">
                <p className="text-base leading-8 text-slate-600">
                  {post.summary}
                </p>
              </div>

              <div className="space-y-5 text-[1rem] leading-8 text-slate-600">
                {post.body?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[1.6rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)] px-5 py-5 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#18399F]">
                  Key Takeaways
                </p>
                <div className="mt-4 space-y-3">
                  {post.takeaways?.map((takeaway) => (
                    <div
                      key={takeaway}
                      className="rounded-[1.1rem] bg-[#F2F6FF] px-4 py-3 text-sm leading-7 text-slate-600"
                    >
                      {takeaway}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] bg-[#18399F] px-5 py-5 text-white shadow-[0_18px_36px_rgba(24,57,159,0.24)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/75">
                  Why It Matters
                </p>
                <p className="mt-4 text-sm leading-7 text-white/88">
                  Every story in this RMS news feed is shaped around clearer
                  renting decisions, better landlord communication, and smoother
                  day-to-day housing workflows.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  )
}

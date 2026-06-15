import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

const contentTypeMap = {
  blog: {
    actionLabel: 'Continue Reading',
  },
  video: {
    actionLabel: 'Watch Video',
  },
  podcast: {
    actionLabel: 'Listen',
  },
}

export default function BlogListCard({
  post,
  contentType = 'blog',
  actionLabel,
  to,
}) {
  const config = contentTypeMap[contentType] ?? contentTypeMap.blog
  const isVideo = contentType === 'video'
  const ActionTag = to ? Link : 'a'
  const actionProps = to ? { to } : { href: post.href ?? '#blog' }

  return (
    <article className="group border-b border-slate-200/80 py-7 text-left first:pt-0 last:border-b-0 last:pb-0">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-center sm:gap-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] text-slate-500">
            <span>{post.date}</span>
            {post.readingTime ? (
              <>
                <span className="size-1 rounded-full bg-slate-300" aria-hidden="true" />
                <span>{post.readingTime}</span>
              </>
            ) : null}
          </div>

          <h3 className="max-w-xl text-[1.6rem] font-semibold leading-[1.35] text-slate-900 sm:text-[1.9rem]">
            <ActionTag
              {...actionProps}
              className="transition-colors duration-300 hover:text-[#18399F]"
            >
              {post.title}
            </ActionTag>
          </h3>

          <ActionTag
            {...actionProps}
            className="inline-flex w-fit text-base font-semibold text-[#18399F] underline decoration-1 underline-offset-4 transition-colors duration-300 hover:text-slate-900"
          >
            {actionLabel ?? config.actionLabel}
          </ActionTag>
        </div>

        <ActionTag
          {...actionProps}
          className="relative overflow-hidden rounded-[1.15rem] bg-slate-100 shadow-[0_14px_28px_rgba(15,23,42,0.08)] sm:justify-self-end"
        >
          {post.image ? (
            <img
              src={post.image}
              alt={post.imageAlt ?? post.title}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:w-[15rem]"
            />
          ) : (
            <div
              className="aspect-[4/3] w-full bg-[linear-gradient(135deg,#E2E8F0,#CBD5E1)] sm:w-[15rem]"
              aria-hidden="true"
            />
          )}

          {isVideo ? (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.1),rgba(15,23,42,0.5))]"
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-white/92 text-[#18399F] shadow-[0_12px_24px_rgba(15,23,42,0.2)] transition-transform duration-300 group-hover:scale-105">
                  <Play className="ml-1 size-6 fill-current" />
                </span>
              </div>
            </>
          ) : null}
        </ActionTag>
      </div>
    </article>
  )
}

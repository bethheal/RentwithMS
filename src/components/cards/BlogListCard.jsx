import { Clock3 } from 'lucide-react'
import { classNames } from '../../utils/classNames.js'

export default function BlogListCard({ isActive, onSelect, post }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      className={classNames(
        'flex w-full items-start justify-between gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition duration-300',
        isActive
          ? 'border-brand-200 bg-brand-50 shadow-soft'
          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/50',
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          <span>{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{post.date}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
          {post.title}
        </h3>
      </div>

      <div className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
        <Clock3 className="size-4" />
        {post.readingTime}
      </div>
    </button>
  )
}

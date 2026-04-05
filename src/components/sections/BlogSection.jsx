import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import bookPattern from '../../assets/illustrations/book-pattern.svg'
import BlogListCard from '../cards/BlogListCard.jsx'
import Container from '../common/Container.jsx'
import PrimaryButton from '../common/PrimaryButton.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

export default function BlogSection({ blog }) {
  const [selectedPostId, setSelectedPostId] = useState(blog.posts[0].id)

  const selectedPost =
    blog.posts.find((post) => post.id === selectedPostId) ?? blog.posts[0]

  return (
    <section id="blog" className="py-0">
      <Container>
        <div className="relative overflow-hidden rounded-[2.25rem] border border-brand-900/10 bg-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <img
            src={bookPattern}
            alt=""
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-45"
            aria-hidden="true"
          />

          <Reveal className="relative z-10">
            <SectionHeading
              eyebrow={blog.eyebrow}
              title={blog.title}
              description={blog.description}
            />
          </Reveal>

          <div className="relative z-10 mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal className="space-y-4" delay={90}>
              {blog.posts.map((post) => (
                <BlogListCard
                  key={post.id}
                  post={post}
                  isActive={post.id === selectedPostId}
                  onSelect={setSelectedPostId}
                />
              ))}
            </Reveal>

            <Reveal delay={160}>
              <article className="h-full rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
                  {selectedPost.category}
                </p>
                <h3 className="mt-4 max-w-xl font-display text-3xl font-bold tracking-[-0.05em] text-brand-950">
                  {selectedPost.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  {selectedPost.summary}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedPost.date}
                    </p>
                    <p className="text-sm text-slate-500">{selectedPost.readingTime}</p>
                  </div>
                  <PrimaryButton variant="outline" showIcon icon={ArrowRight}>
                    Learn More
                  </PrimaryButton>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}

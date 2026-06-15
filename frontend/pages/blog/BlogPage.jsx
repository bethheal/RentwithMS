import { useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import BlogSection from '../../components/sections/BlogSection.jsx'
import BlogStoryModal from '../../components/sections/BlogStoryModal.jsx'
import FooterSection from '../../components/sections/FooterSection.jsx'
import { landingPageContent } from '../home/HomePage.jsx'

function createPostBody(post, contentType) {
  const contentTypeMessage = {
    blog:
      'The full article expands on the design and operational patterns behind the headline.',
    podcast:
      'The full discussion opens up the practical questions people keep asking in real rental conversations.',
    video:
      'The full video update breaks the story into simple, visual takeaways that are easy to act on.',
  }

  return [
    `${post.summary} ${contentTypeMessage[contentType] ?? contentTypeMessage.blog}`,
    `${post.title} shows that renters and landlords respond better when the next step is obvious, the information is structured well, and the platform removes small points of friction before they grow into delays.`,
    `Across the RMS experience, the bigger lesson is consistency. Clear listings, calm communication, and guided actions help people compare options faster, trust what they are seeing, and move forward with more confidence.`,
  ]
}

function createPostTakeaways(post, contentType) {
  const mediaAction = {
    blog: 'Read the practical detail, not just the headline',
    podcast: 'Listen for the real questions behind the update',
    video: 'Watch how the information is framed visually',
  }

  return [
    post.category,
    mediaAction[contentType] ?? mediaAction.blog,
    'Clearer rental information leads to faster, calmer decisions',
  ]
}

export default function BlogPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedPostId = searchParams.get('post')

  const blog = useMemo(() => {
    return {
      ...landingPageContent.blog,
      filters: landingPageContent.blog.filters.map((filter) => {
        const contentType = filter.contentType ?? 'blog'

        return {
          ...filter,
          posts: filter.posts.map((post) => ({
            ...post,
            contentType,
            body: createPostBody(post, contentType),
            takeaways: createPostTakeaways(post, contentType),
            filterId: filter.id,
          })),
        }
      }),
    }
  }, [])

  const allPosts = useMemo(
    () => blog.filters.flatMap((filter) => filter.posts),
    [blog.filters],
  )
  const selectedPost =
    allPosts.find((post) => post.id === selectedPostId) ?? null
  const initialFilterId = searchParams.get('filter') ?? selectedPost?.filterId

  const handleCloseModal = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('post')

    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : '',
        hash: '#blog',
      },
      { replace: true },
    )
  }

  return (
    <>
      <BlogSection blog={blog} actionPath="/blog" initialFilterId={initialFilterId} />
      <FooterSection footer={landingPageContent.footer} />
      <BlogStoryModal post={selectedPost} onClose={handleCloseModal} />
    </>
  )
}

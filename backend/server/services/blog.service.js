import prisma from '../config/prisma.js'
import ApiError from '../utils/apiError.js'
import { safeDestroyImage } from './cloudinary.service.js'

const blogInclude = {
  author: true,
}

async function getBlogOrThrow(blogId) {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: blogInclude,
  })

  if (!blog) {
    throw new ApiError(404, 'Blog post not found.')
  }

  return blog
}

export function listBlogs() {
  return prisma.blog.findMany({
    include: blogInclude,
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export function getBlogById(blogId) {
  return getBlogOrThrow(blogId)
}

export function createBlog(blogData, currentUser, uploadedImage = null) {
  return prisma.blog.create({
    data: {
      title: blogData.title.trim(),
      content: blogData.content.trim(),
      imageUrl: uploadedImage?.url ?? blogData.imageUrl ?? null,
      imagePublicId: uploadedImage?.publicId ?? blogData.imagePublicId ?? null,
      authorId: currentUser.id,
    },
    include: blogInclude,
  })
}

export async function updateBlog(blogId, blogData, uploadedImage = null) {
  const existingBlog = await getBlogOrThrow(blogId)
  const updates = {}

  if (blogData.title !== undefined) {
    updates.title = blogData.title.trim()
  }

  if (blogData.content !== undefined) {
    updates.content = blogData.content.trim()
  }

  if (uploadedImage) {
    if (existingBlog.imagePublicId) {
      await safeDestroyImage(existingBlog.imagePublicId)
    }

    updates.imageUrl = uploadedImage.url
    updates.imagePublicId = uploadedImage.publicId
  } else if (blogData.removeImage) {
    if (existingBlog.imagePublicId) {
      await safeDestroyImage(existingBlog.imagePublicId)
    }

    updates.imageUrl = null
    updates.imagePublicId = null
  } else if (blogData.imageUrl && blogData.imagePublicId) {
    if (
      existingBlog.imagePublicId &&
      existingBlog.imagePublicId !== blogData.imagePublicId
    ) {
      await safeDestroyImage(existingBlog.imagePublicId)
    }

    updates.imageUrl = blogData.imageUrl
    updates.imagePublicId = blogData.imagePublicId
  }

  return prisma.blog.update({
    where: { id: blogId },
    data: updates,
    include: blogInclude,
  })
}

export async function deleteBlog(blogId) {
  const blog = await getBlogOrThrow(blogId)

  if (blog.imagePublicId) {
    await safeDestroyImage(blog.imagePublicId)
  }

  await prisma.blog.delete({
    where: { id: blogId },
  })

  return blog
}

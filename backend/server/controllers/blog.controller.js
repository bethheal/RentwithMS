import asyncHandler from '../utils/asyncHandler.js'
import { serializeBlog } from '../utils/serializers.js'
import {
  createBlog,
  deleteBlog,
  getBlogById,
  listBlogs,
  updateBlog,
} from '../services/blog.service.js'
import { safeDestroyImage, uploadSingleImage } from '../services/cloudinary.service.js'

export const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await listBlogs()

  res.status(200).json({
    success: true,
    data: blogs.map(serializeBlog),
  })
})

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await getBlogById(req.params.id)

  res.status(200).json({
    success: true,
    data: serializeBlog(blog),
  })
})

export const createBlogPost = asyncHandler(async (req, res) => {
  let uploadedImage = null

  if (req.file) {
    uploadedImage = await uploadSingleImage(req.file, 'rms/blogs')
  }

  try {
    const blog = await createBlog(req.body, req.user, uploadedImage)

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully.',
      data: serializeBlog(blog),
    })
  } catch (error) {
    if (uploadedImage) {
      await safeDestroyImage(uploadedImage.publicId)
    }

    throw error
  }
})

export const updateBlogPost = asyncHandler(async (req, res) => {
  let uploadedImage = null

  if (req.file) {
    uploadedImage = await uploadSingleImage(req.file, 'rms/blogs')
  }

  try {
    const blog = await updateBlog(req.params.id, req.body, uploadedImage)

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully.',
      data: serializeBlog(blog),
    })
  } catch (error) {
    if (uploadedImage) {
      await safeDestroyImage(uploadedImage.publicId)
    }

    throw error
  }
})

export const removeBlogPost = asyncHandler(async (req, res) => {
  const blog = await deleteBlog(req.params.id)

  res.status(200).json({
    success: true,
    message: 'Blog post deleted successfully.',
    data: serializeBlog(blog),
  })
})

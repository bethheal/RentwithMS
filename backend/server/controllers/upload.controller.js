import ApiError from '../utils/apiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import { serializeProperty } from '../utils/serializers.js'
import { uploadSingleImage } from '../services/cloudinary.service.js'
import { addPropertyImages } from '../services/property.service.js'

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'Upload at least one property image.')
  }

  const property = await addPropertyImages(req.params.propertyId, req.files, req.user)

  res.status(200).json({
    success: true,
    message: 'Property images uploaded successfully.',
    data: serializeProperty(property),
  })
})

export const uploadBlogImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Upload a blog image file.')
  }

  const uploadedImage = await uploadSingleImage(req.file, 'rms/blogs')

  res.status(200).json({
    success: true,
    message: 'Blog image uploaded successfully.',
    data: {
      imageUrl: uploadedImage.url,
      imagePublicId: uploadedImage.publicId,
    },
  })
})

import cloudinary from '../config/cloudinary.js'
import ApiError from '../utils/apiError.js'

export function uploadSingleImage(file, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, 'Image upload to Cloudinary failed.'))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    uploadStream.end(file.buffer)
  })
}

export function uploadManyImages(files, folder) {
  return Promise.all(files.map((file) => uploadSingleImage(file, folder)))
}

export async function destroyImage(publicId) {
  if (!publicId) {
    return null
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  })
}

export async function safeDestroyImage(publicId) {
  if (!publicId) {
    return
  }

  try {
    await destroyImage(publicId)
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}.`)
    console.error(error)
  }
}

export async function safeDestroyImages(publicIds) {
  await Promise.all(publicIds.filter(Boolean).map((publicId) => safeDestroyImage(publicId)))
}

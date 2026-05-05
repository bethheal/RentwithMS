import multer from 'multer'
import ApiError from '../utils/apiError.js'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, 'Only JPG, PNG, and WEBP image files are allowed.'))
      return
    }

    callback(null, true)
  },
})

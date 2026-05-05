import asyncHandler from '../utils/asyncHandler.js'
import { serializeProperty } from '../utils/serializers.js'
import {
  createProperty,
  deleteProperty,
  deletePropertyImage,
  getPropertyById,
  listManagedProperties,
  listProperties,
  updateProperty,
} from '../services/property.service.js'

export const getProperties = asyncHandler(async (req, res) => {
  const properties = await listProperties()

  res.status(200).json({
    success: true,
    data: properties.map(serializeProperty),
  })
})

export const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await listManagedProperties(req.user)

  res.status(200).json({
    success: true,
    data: properties.map(serializeProperty),
  })
})

export const getProperty = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id)

  res.status(200).json({
    success: true,
    data: serializeProperty(property),
  })
})

export const createPropertyListing = asyncHandler(async (req, res) => {
  const property = await createProperty(req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Property created successfully.',
    data: serializeProperty(property),
  })
})

export const updatePropertyListing = asyncHandler(async (req, res) => {
  const property = await updateProperty(req.params.id, req.body, req.user)

  res.status(200).json({
    success: true,
    message: 'Property updated successfully.',
    data: serializeProperty(property),
  })
})

export const removePropertyListing = asyncHandler(async (req, res) => {
  const property = await deleteProperty(req.params.id, req.user)

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully.',
    data: serializeProperty(property),
  })
})

export const removePropertyImage = asyncHandler(async (req, res) => {
  const image = await deletePropertyImage(
    req.params.propertyId,
    req.params.imageId,
    req.user
  )

  res.status(200).json({
    success: true,
    message: 'Property image deleted successfully.',
    data: {
      id: image.id,
      propertyId: image.propertyId,
      url: image.url,
      cloudinaryPublicId: image.cloudinaryPublicId,
    },
  })
})

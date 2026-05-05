import prisma from '../config/prisma.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'
import { safeDestroyImages, safeDestroyImage, uploadManyImages } from './cloudinary.service.js'

const propertyInclude = {
  owner: true,
  images: {
    orderBy: {
      createdAt: 'asc',
    },
  },
}

async function getPropertyOrThrow(propertyId) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: propertyInclude,
  })

  if (!property) {
    throw new ApiError(404, 'Property not found.')
  }

  return property
}

async function getAllowedOwnerOrThrow(ownerId) {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
  })

  if (!owner) {
    throw new ApiError(404, 'The selected property owner was not found.')
  }

  if (owner.role === ROLES.TENANT) {
    throw new ApiError(400, 'Tenants cannot be assigned as property owners.')
  }

  return owner
}

function ensurePropertyManager(property, currentUser) {
  if (currentUser.role === ROLES.ADMIN) {
    return
  }

  if (currentUser.role === ROLES.LANDLORD && property.ownerId === currentUser.id) {
    return
  }

  throw new ApiError(403, 'You do not have permission to manage this property.')
}

export function listProperties() {
  return prisma.property.findMany({
    include: propertyInclude,
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function listManagedProperties(currentUser) {
  const where =
    currentUser.role === ROLES.ADMIN
      ? {}
      : {
          ownerId: currentUser.id,
        }

  return prisma.property.findMany({
    where,
    include: propertyInclude,
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export function getPropertyById(propertyId) {
  return getPropertyOrThrow(propertyId)
}

export async function createProperty(propertyData, currentUser) {
  const ownerId =
    currentUser.role === ROLES.ADMIN
      ? propertyData.ownerId ?? currentUser.id
      : currentUser.id

  await getAllowedOwnerOrThrow(ownerId)

  return prisma.property.create({
    data: {
      title: propertyData.title.trim(),
      description: propertyData.description.trim(),
      price: propertyData.price,
      location: propertyData.location.trim(),
      ownerId,
    },
    include: propertyInclude,
  })
}

export async function updateProperty(propertyId, propertyData, currentUser) {
  const property = await getPropertyOrThrow(propertyId)

  ensurePropertyManager(property, currentUser)

  const updates = {
    title: propertyData.title?.trim(),
    description: propertyData.description?.trim(),
    price: propertyData.price,
    location: propertyData.location?.trim(),
  }

  if (currentUser.role === ROLES.ADMIN && propertyData.ownerId) {
    await getAllowedOwnerOrThrow(propertyData.ownerId)
    updates.ownerId = propertyData.ownerId
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key]
    }
  })

  return prisma.property.update({
    where: { id: propertyId },
    data: updates,
    include: propertyInclude,
  })
}

export async function deleteProperty(propertyId, currentUser) {
  const property = await getPropertyOrThrow(propertyId)

  ensurePropertyManager(property, currentUser)

  await safeDestroyImages(property.images.map((image) => image.cloudinaryPublicId))

  await prisma.property.delete({
    where: { id: propertyId },
  })

  return property
}

export async function addPropertyImages(propertyId, files, currentUser) {
  const property = await getPropertyOrThrow(propertyId)

  ensurePropertyManager(property, currentUser)

  const uploadedImages = await uploadManyImages(files, `rms/properties/${property.id}`)

  try {
    await prisma.$transaction(
      uploadedImages.map((image) =>
        prisma.propertyImage.create({
          data: {
            url: image.url,
            cloudinaryPublicId: image.publicId,
            propertyId: property.id,
          },
        })
      )
    )
  } catch (error) {
    await safeDestroyImages(uploadedImages.map((image) => image.publicId))
    throw error
  }

  return getPropertyOrThrow(propertyId)
}

export async function deletePropertyImage(propertyId, imageId, currentUser) {
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    include: {
      property: true,
    },
  })

  if (!image || image.propertyId !== propertyId) {
    throw new ApiError(404, 'Property image not found.')
  }

  ensurePropertyManager(image.property, currentUser)

  await safeDestroyImage(image.cloudinaryPublicId)

  await prisma.propertyImage.delete({
    where: { id: imageId },
  })

  return image
}

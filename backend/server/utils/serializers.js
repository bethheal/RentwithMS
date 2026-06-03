export function serializeUser(user) {
  if (!user) {
    return null
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    deactivatedAt: user.deactivatedAt,
    scheduledDeletionDate: user.scheduledDeletionDate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  if (user._count) {
    serializedUser.counts = {
      properties: user._count.properties ?? 0,
      blogPosts: user._count.blogPosts ?? 0,
    }
  }

  return serializedUser
}

export function serializePropertyImage(image) {
  return {
    id: image.id,
    url: image.url,
    cloudinaryPublicId: image.cloudinaryPublicId,
    createdAt: image.createdAt,
  }
}

export function serializeProperty(property) {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    price: Number(property.price),
    location: property.location,
    ownerId: property.ownerId,
    owner: property.owner ? serializeUser(property.owner) : null,
    images: (property.images ?? []).map(serializePropertyImage),
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  }
}

export function serializeBlog(blog) {
  return {
    id: blog.id,
    title: blog.title,
    content: blog.content,
    imageUrl: blog.imageUrl,
    imagePublicId: blog.imagePublicId,
    authorId: blog.authorId,
    author: blog.author ? serializeUser(blog.author) : null,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  }
}

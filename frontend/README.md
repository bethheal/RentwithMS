# RMS Full Stack App

RMS is a rental management application with an existing React frontend and a Node.js + Express backend. The backend is organized for easy editing and uses PostgreSQL, Prisma, Cloudinary, and JWT authentication.

## Stack

- Frontend: React 19, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + bcrypt password hashing
- File storage: Cloudinary

## Backend Features

- Admin-only user creation
- Roles: `admin`, `landlord`, `tenant`
- JWT login and protected route middleware
- Role-based access control
- Property CRUD for landlords and admins
- Multiple Cloudinary images per property
- Admin-managed blog system with public read endpoints
- Centralized validation and error responses

## Folder Structure

```text
backend/
  .env.example
  prisma/
    schema.prisma
    seed.js
  server/
    app.js
    config/
      cloudinary.js
      env.js
      prisma.js
    constants/
      roles.js
    controllers/
    middleware/
    routes/
    services/
    utils/
    validators/
  server.js
src/
  components/
  context/
  layouts/
  pages/
  routes/
```

## Prisma Models

The Prisma schema lives in [backend/prisma/schema.prisma](/c:/Users/Gallopsea/OneDrive/Documents/Projects/RMs/backend/prisma/schema.prisma).

- `User`: stores name, email, hashed password, and role
- `Property`: stores listing details and the owner relation
- `PropertyImage`: stores Cloudinary image URLs and public IDs for each property
- `Blog`: stores landing-page blog content and optional Cloudinary image metadata

## Environment Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in your real values.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rms_db?schema=public"
CLIENT_ORIGIN="http://localhost:5173,https://your-frontend.example.com"
JWT_SECRET="replace-this-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
ADMIN_NAME="System Admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
```

`CLIENT_ORIGIN` accepts one frontend URL or a comma-separated list.

## Install And Run

### Requirements

- Node.js 20+
- npm 10+
- PostgreSQL

### 1. Install Dependencies

```bash
npm install
```

### 2. Create The Database

Create a PostgreSQL database that matches the name in `DATABASE_URL`.

### 3. Run Prisma Migration

```bash
npm run prisma:migrate -- --name init
```

### 4. Seed The First Admin

The seed script creates or updates the initial admin account from your env file.

```bash
npm run db:seed
```

### 5. Start The Apps

Frontend:

```bash
npm run dev
```

Backend API:

```bash
npm run server:dev
```

Production server after building the frontend:

```bash
npm run build
npm start
```

## Available Scripts

```bash
npm run dev
npm run dev:client
npm run server:dev
npm run build
npm start
npm run lint
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:deploy
npm run prisma:studio
npm run db:seed
```

## API Overview

All API responses use the same shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Validation errors return `success: false` and an `errors` array when useful.

### Auth

- `POST /auth/login`
- `GET /auth/me`

Sample login body:

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

Use the returned token in the `Authorization` header:

```text
Authorization: Bearer your-jwt-token
```

### Users

- `GET /users` admin only
- `POST /users` admin only
- `PATCH /users/:id/role` admin only
- `DELETE /users/:id` admin only

Sample create user body:

```json
{
  "name": "Amina Hassan",
  "email": "amina@example.com",
  "password": "StrongPass123!",
  "role": "landlord"
}
```

### Properties

- `GET /properties` public
- `GET /properties/:id` public
- `GET /properties/mine` admin or landlord
- `POST /properties` admin or landlord
- `PUT /properties/:id` admin or landlord
- `DELETE /properties/:id` admin or landlord
- `DELETE /properties/:propertyId/images/:imageId` admin or landlord

Sample create property body:

```json
{
  "title": "Modern Duplex",
  "description": "A spacious duplex close to schools and transit.",
  "price": 1850,
  "location": "Accra, Ghana"
}
```

Admins can also set `ownerId` when creating or updating a property.

### Uploads

- `POST /uploads/properties/:propertyId/images` admin or landlord
- `POST /uploads/blogs/image` admin only

Property image uploads should use `multipart/form-data` with the field name `images`.
Blog image uploads should use `multipart/form-data` with the field name `image`.

Recommended property flow:

1. Create the property with `POST /properties`
2. Upload one or more images to `POST /uploads/properties/:propertyId/images`

### Blogs

- `GET /blogs` public
- `GET /blogs/:id` public
- `POST /blogs` admin only
- `PATCH /blogs/:id` admin only
- `DELETE /blogs/:id` admin only

Blog create and update routes support either JSON bodies or `multipart/form-data` when uploading an image directly.

Sample create blog body:

```json
{
  "title": "How To Prepare A Rental Unit",
  "content": "Start with a full inspection, complete repairs, and document the unit before listing it."
}
```

## Notes For Frontend Integration

- The API is mounted at the root path, so your frontend can call `/auth`, `/users`, `/properties`, `/uploads`, and `/blogs`.
- The backend allows one or many frontend origins through `CLIENT_ORIGIN`.
- The first admin is created through Prisma seed so account creation stays admin-only.
- Property and blog images are stored in Cloudinary, while the returned URLs and public IDs are stored in PostgreSQL through Prisma.

## Deployment

For Render or similar Node hosts:

```bash
Build Command: npm install && npm run build
Start Command: npm start
```

Set the same environment variables from `backend/.env.example` in your hosting dashboard.

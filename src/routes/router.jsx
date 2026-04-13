import { createElement, lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLoader from '../components/common/AppLoader.jsx'
import GuestOnlyRoute from '../components/common/GuestOnlyRoute.jsx'
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import MainLayout from '../layouts/MainLayout.jsx'

const HomePage = lazy(() => import('../pages/home/HomePage.jsx'))
const BlogPage = lazy(() => import('../pages/blog/BlogPage.jsx'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'))
const SignupPage = lazy(() => import('../pages/auth/SignupPage.jsx'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'))
const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage.jsx'))

function renderLazyPage(PageComponent) {
  return (
    <Suspense fallback={<AppLoader />}>
      {createElement(PageComponent)}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: renderLazyPage(HomePage) },
      { path: 'blog', element: renderLazyPage(BlogPage) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestOnlyRoute>{renderLazyPage(LoginPage)}</GuestOnlyRoute>
        ),
      },
      {
        path: '/signup',
        element: (
          <GuestOnlyRoute>{renderLazyPage(SignupPage)}</GuestOnlyRoute>
        ),
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: renderLazyPage(DashboardPage) }],
  },
  {
    path: '*',
    element: renderLazyPage(NotFoundPage),
  },
])

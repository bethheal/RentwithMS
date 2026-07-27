import { createElement, lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLoader from "../components/common/AppLoader.jsx";
import GuestOnlyRoute from "../components/common/GuestOnlyRoute.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { ROUTES } from "./routePaths.js";

const HomePage = lazy(() => import("../pages/home/HomePage.jsx"));
const BlogPage = lazy(() => import("../pages/blog/BlogPage.jsx"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const ResetPasswordPage = lazy(
  () => import("../pages/auth/ResetPasswordPage.jsx"),
);
const SignupPage = lazy(() => import("../pages/auth/SignupPage.jsx"));
const VerificationPage = lazy(
  () => import("../pages/auth/VerificationPage.jsx"),
);
const DashboardPage = lazy(
  () => import("../pages/dashboard/DashboardPage.jsx"),
);
const NotFoundPage = lazy(() => import("../pages/not-found/NotFoundPage.jsx"));

function renderLazyPage(PageComponent) {
  return (
    <Suspense fallback={<AppLoader />}>{createElement(PageComponent)}</Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: renderLazyPage(HomePage) },
      { path: ROUTES.BLOG, element: renderLazyPage(BlogPage) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <GuestOnlyRoute>{renderLazyPage(LoginPage)}</GuestOnlyRoute>,
      },
      {
        path: ROUTES.SIGNUP,
        element: <GuestOnlyRoute>{renderLazyPage(SignupPage)}</GuestOnlyRoute>,
      },
      {
        path: ROUTES.VERIFY_ACCOUNT,
        element: (
          <GuestOnlyRoute>{renderLazyPage(VerificationPage)}</GuestOnlyRoute>
        ),
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: (
          <GuestOnlyRoute>{renderLazyPage(ResetPasswordPage)}</GuestOnlyRoute>
        ),
      },
    ],
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: renderLazyPage(DashboardPage) }],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: renderLazyPage(NotFoundPage),
  },
]);

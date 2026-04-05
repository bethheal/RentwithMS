import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AppLoader from './AppLoader.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return <AppLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

import AdminTrustDashboardView from '../../components/dashboard/AdminTrustDashboardView.jsx'
import LandlordDashboardView from '../../components/dashboard/LandlordDashboardView.jsx'
import TenantDashboardView from '../../components/dashboard/TenantDashboardView.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardPage() {
  const { user } = useAuth()
  const isTenant = user?.role?.toLowerCase() === 'tenant'
  const isLandlord = user?.role?.toLowerCase() === 'landlord'

  if (isTenant) {
    return <TenantDashboardView />
  }

  if (isLandlord) {
    return <LandlordDashboardView />
  }

  return <AdminTrustDashboardView />
}

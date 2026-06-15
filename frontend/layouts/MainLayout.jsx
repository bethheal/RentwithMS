import { Outlet } from 'react-router-dom'
import MobileSidebar from '../components/navigation/MobileSidebar.jsx'
import Navbar from '../components/navigation/Navbar.jsx'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <MobileSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

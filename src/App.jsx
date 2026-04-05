import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './context/AppProviders.jsx'
import { router } from './routes/router.jsx'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

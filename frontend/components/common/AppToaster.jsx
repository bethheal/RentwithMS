import { Toaster } from 'react-hot-toast'

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 3600,
        style: {
          background: '#FFFFFF',
          border: '1px solid #DCE5F7',
          borderRadius: '1rem',
          boxShadow: '0 18px 36px rgba(15,32,86,0.14)',
          color: '#102A74',
          maxWidth: '28rem',
          padding: '0.95rem 1rem',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          duration: 4200,
          iconTheme: {
            primary: '#E85D4D',
            secondary: '#FFFFFF',
          },
          style: {
            background: '#FFF4F1',
            border: '1px solid #F3C9BF',
            color: '#9A3D2A',
          },
        },
      }}
    />
  )
}

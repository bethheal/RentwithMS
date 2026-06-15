import { useEffect } from 'react'

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) {
      return undefined
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [isLocked])
}

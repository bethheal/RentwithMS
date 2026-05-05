const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'

let googleScriptPromise

function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google sign-in.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

export async function requestGoogleIdToken(clientId) {
  if (!clientId) {
    throw new Error('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID first.')
  }

  const google = await loadGoogleIdentityScript()

  if (!google?.accounts?.id) {
    throw new Error('Google sign-in is unavailable right now.')
  }

  return new Promise((resolve, reject) => {
    let settled = false

    const finish = (handler) => (value) => {
      if (settled) {
        return
      }

      settled = true
      handler(value)
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          finish(reject)(new Error('Google did not return a sign-in token.'))
          return
        }

        finish(resolve)(response.credential)
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    })

    google.accounts.id.prompt((notification) => {
      if (settled) {
        return
      }

      const notDisplayed =
        typeof notification.isNotDisplayed === 'function' &&
        notification.isNotDisplayed()
      const skipped =
        typeof notification.isSkippedMoment === 'function' &&
        notification.isSkippedMoment()
      const dismissed =
        typeof notification.isDismissedMoment === 'function' &&
        notification.isDismissedMoment()

      if (notDisplayed || skipped || dismissed) {
        finish(reject)(
          new Error('Google sign-in was cancelled or could not be opened.')
        )
      }
    })
  })
}

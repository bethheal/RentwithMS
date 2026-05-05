import toast from 'react-hot-toast'

function formatFieldLabel(field) {
  return String(field ?? '')
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .trim()
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error) {
    return fallback
  }

  if (typeof error === 'string') {
    return error
  }

  const details = Array.isArray(error.details) ? error.details : []
  const firstDetail = details.find((detail) => detail?.message)

  if (firstDetail?.message) {
    const fieldLabel = formatFieldLabel(firstDetail.field)

    return fieldLabel
      ? `${fieldLabel}: ${firstDetail.message}`
      : firstDetail.message
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function showSuccessToast(message) {
  return toast.success(message)
}

export function showErrorToast(error, fallback) {
  return toast.error(getErrorMessage(error, fallback))
}

export function showInfoToast(message) {
  return toast(message, {
    icon: 'i',
  })
}

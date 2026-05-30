import { apiCallAuth } from './client'

export const reviewCoverLetter = (text, includeSpellCheck = true) =>
  apiCallAuth('/api/coverletter/review', {
    method: 'POST',
    body: JSON.stringify({ text, includeSpellCheck }),
  })

export const saveCoverLetter = (data) =>
  apiCallAuth('/api/coverletter/history', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getCoverLetterHistory = () =>
  apiCallAuth('/api/coverletter/history')

export const deleteCoverLetter = (id) =>
  apiCallAuth(`/api/coverletter/history/${id}`, { method: 'DELETE' })

export const togglePinCoverLetter = (id) =>
  apiCallAuth(`/api/coverletter/history/${id}/pin`, { method: 'PATCH' })

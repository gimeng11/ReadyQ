import { apiCallAuth } from './client'

export const reviewCoverLetter = (text, includeSpellCheck = true) =>
  apiCallAuth('/api/coverletter/review', {
    method: 'POST',
    body: JSON.stringify({ text, includeSpellCheck }),
  })

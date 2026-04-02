import { apiCall } from './client'

export const login = (username, password) =>
  apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const signUp = (data) =>
  apiCall('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const sendSms = (phone) =>
  apiCall('/api/auth/sms/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })

export const verifySms = (phone, code) =>
  apiCall('/api/auth/sms/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })

export const sendEmail = (email) =>
  apiCall('/api/auth/email/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

export const findUsername = (email, code) =>
  apiCall('/api/auth/find-username', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })

export const verifyForPasswordReset = (username, email, code) =>
  apiCall('/api/auth/find-password/verify', {
    method: 'POST',
    body: JSON.stringify({ username, email, code }),
  })

export const resetPassword = (resetToken, newPassword) =>
  apiCall('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword }),
  })

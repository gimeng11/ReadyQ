import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost
  console.log('[API] Constants.expoConfig?.hostUri:', Constants.expoConfig?.hostUri)
  console.log('[API] Constants.manifest?.debuggerHost:', Constants.manifest?.debuggerHost)
  if (hostUri) {
    const host = hostUri.split(':')[0]
    console.log('[API] 감지된 host:', host)
    return `http://${host}:8080`
  }
  console.log('[API] host 감지 실패 → fallback 사용')
  return 'http://10.0.2.2:8080'
}

export const BASE_URL = getBaseUrl()
console.log('[API] BASE_URL:', BASE_URL)

export async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  console.log(`[API] 요청: ${options.method ?? 'GET'} ${url}`)
  console.log('[API] body:', options.body)
  console.log('[API] headers:', options.headers)

  // headers를 분리해서 ...options가 덮어쓰지 않도록 처리
  const { headers: optionHeaders, ...restOptions } = options

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...optionHeaders },
      ...restOptions,
    })

    console.log('[API] 응답 status:', res.status)
    const text = await res.text()
    console.log('[API] 응답 raw:', text.substring(0, 300))

    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다 (status: ${res.status}): ${text.substring(0, 100)}`)
    }
    console.log('[API] 응답 data:', JSON.stringify(data))

    if (!res.ok) {
      if (data.errors) {
        const messages = Object.values(data.errors).join('\n')
        throw new Error(messages)
      }
      throw new Error(data.message || '서버 오류가 발생했습니다')
    }

    return data
  } catch (e) {
    console.log('[API] 오류:', e.message)
    throw e
  }
}

// JWT 토큰을 자동으로 헤더에 포함하는 인증 API 호출
export async function apiCallAuth(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('token')
  console.log('[API] 토큰 확인:', token ? `Bearer ${token.substring(0, 20)}...` : '없음 (로그인 필요)')
  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })
}

// 영상 업로드용 multipart/form-data 인증 호출
export async function apiCallMultipart(endpoint, formData) {
  const token = await AsyncStorage.getItem('token')
  const url = `${BASE_URL}${endpoint}`
  console.log(`[API] Multipart 요청: POST ${url}`)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // Content-Type은 설정하지 않음 — fetch가 FormData boundary를 자동으로 포함시켜줌
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    })

    console.log('[API] Multipart 응답 status:', res.status)
    const data = await res.json()
    console.log('[API] Multipart 응답 data:', JSON.stringify(data))

    if (!res.ok) {
      throw new Error(data.message || '서버 오류가 발생했습니다')
    }
    return data
  } catch (e) {
    console.log('[API] Multipart 오류:', e.message)
    throw e
  }
}

import Constants from 'expo-constants'

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

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })

    console.log('[API] 응답 status:', res.status)
    const data = await res.json()
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

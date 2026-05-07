import { apiCallAuth, apiCallMultipart } from './client'

// 면접 세션 시작 + 1교시 질문 생성
// request: { interviewerType, coverLetter, targetCompany, targetJob }
export const startInterview = (data) =>
  apiCallAuth('/api/interview/start', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// 교시 영상 제출 → Gemini 피드백 생성
export const submitPeriodAnswer = (sessionId, num, videoUri) => {
  const formData = new FormData()
  formData.append('video', {
    uri: videoUri,
    type: 'video/mp4',
    name: `period_${num}.mp4`,
  })
  return apiCallMultipart(`/api/interview/${sessionId}/period/${num}/submit`, formData)
}

// 쉬는시간 선택지 조회 (꼬리질문 5개 + 새질문 + 종료)
export const getNextOptions = (sessionId, num) =>
  apiCallAuth(`/api/interview/${sessionId}/period/${num}/options`)

// 다음 교시 진행 (FOLLOW_UP / NEW_QUESTION / END_INTERVIEW)
export const proceedToNextPeriod = (sessionId, num, choiceType, selectedQuestion = null) =>
  apiCallAuth(`/api/interview/${sessionId}/period/${num}/next`, {
    method: 'POST',
    body: JSON.stringify({ choiceType, selectedQuestion }),
  })

// 면접 종료 + 최종 피드백 생성
export const completeInterview = (sessionId) =>
  apiCallAuth(`/api/interview/${sessionId}/complete`, { method: 'POST' })

// 최종 피드백 조회
export const getSessionFeedback = (sessionId) =>
  apiCallAuth(`/api/interview/${sessionId}/feedback`)

// 교시별 피드백 조회
export const getPeriodFeedback = (sessionId, num) =>
  apiCallAuth(`/api/interview/${sessionId}/period/${num}/feedback`)

// 면접 기록 목록 조회
export const getInterviewHistory = () =>
  apiCallAuth('/api/interview/history')

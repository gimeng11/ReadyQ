import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { CameraView, Camera } from 'expo-camera'
import { styles } from './InterviewCameraStyles'
import CustomText from '../../components/CustomText'
import {
  submitPeriodAnswer,
  getNextOptions,
  proceedToNextPeriod,
  completeInterview,
} from '../../api/interview'

export default function InterviewCamera({ navigation, route }) {
  const { sessionId, question: initialQuestion, periodNum: initialPeriodNum } = route.params

  // 카메라
  const cameraRef = useRef(null)
  const [facing, setFacing] = useState('front')
  const [hasPermission, setHasPermission] = useState(null)

  // 면접 흐름
  // guide → question → submitting → break → (selectFollowUp) → question (반복)
  const [phase, setPhase] = useState('guide')
  const [periodNum, setPeriodNum] = useState(initialPeriodNum)
  const [question, setQuestion] = useState(initialQuestion)

  // 가이드 카운트다운 (30초)
  const [timeLeft, setTimeLeft] = useState(30)

  // 영상 URI (녹화 후 세팅)
  const [videoUri, setVideoUri] = useState(null)

  // 쉬는시간 피드백 요약 (BreakTimeResponse)
  const [breakData, setBreakData] = useState(null)

  // 다음 교시 선택지 (NextPeriodOptions)
  const [options, setOptions] = useState(null)

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // exit 모달
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // 카메라 + 마이크 권한 요청
  useEffect(() => {
    ;(async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync()
      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync()
      setHasPermission(camStatus === 'granted' && micStatus === 'granted')
    })()
  }, [])

  // 가이드 카운트다운
  useEffect(() => {
    if (phase !== 'guide') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setPhase('question')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  // question 단계 진입 시 녹화 시작
  useEffect(() => {
    if (phase === 'question') {
      startRecording()
    }
  }, [phase, periodNum])

  // 녹화된 videoUri가 세팅되면 submit 호출
  useEffect(() => {
    if (videoUri && phase === 'submitting') {
      handleSubmit()
    }
  }, [videoUri])

  const startRecording = async () => {
    if (!cameraRef.current) return
    try {
      setVideoUri(null)
      const result = await cameraRef.current.recordAsync({ maxDuration: 300 })
      setVideoUri(result.uri)
    } catch (e) {
      console.log('[Camera] 녹화 오류:', e.message)
    }
  }

  // 체크 버튼 → 녹화 중지 후 submit
  const handleCheckPress = () => {
    setPhase('submitting')
    cameraRef.current?.stopRecording()
  }

  // 영상 제출 → 쉬는시간 피드백
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await submitPeriodAnswer(sessionId, periodNum, videoUri)
      setBreakData(result)

      // 선택지 미리 fetch
      const opts = await getNextOptions(sessionId, periodNum)
      setOptions(opts)

      setPhase('break')
    } catch (e) {
      Alert.alert('오류', e.message)
      setPhase('question')
    } finally {
      setLoading(false)
    }
  }

  // 꼬리 질문 목록 표시
  const handleShowFollowUp = () => {
    setPhase('selectFollowUp')
  }

  // 꼬리 질문 선택 → 다음 교시
  const handleSelectFollowUp = async (selectedQuestion) => {
    setLoading(true)
    try {
      const res = await proceedToNextPeriod(sessionId, periodNum, 'FOLLOW_UP', selectedQuestion)
      setPeriodNum(res.periodNum)
      setQuestion(res.question)
      setOptions(null)
      setBreakData(null)
      setVideoUri(null)
      setTimeLeft(30)
      setPhase('guide')
    } catch (e) {
      Alert.alert('오류', e.message)
      setPhase('break')
    } finally {
      setLoading(false)
    }
  }

  // 새 질문 → 다음 교시
  const handleNewQuestion = async () => {
    setLoading(true)
    try {
      const res = await proceedToNextPeriod(sessionId, periodNum, 'NEW_QUESTION')
      setPeriodNum(res.periodNum)
      setQuestion(res.question)
      setOptions(null)
      setBreakData(null)
      setVideoUri(null)
      setTimeLeft(30)
      setPhase('guide')
    } catch (e) {
      Alert.alert('오류', e.message)
      setPhase('break')
    } finally {
      setLoading(false)
    }
  }

  // 면접 종료 → 최종 피드백 생성
  const handleEndInterview = async () => {
    setLoading(true)
    try {
      await completeInterview(sessionId)
      navigation.replace('InterviewEnd', { sessionId })
    } catch (e) {
      Alert.alert('오류', e.message)
      setPhase('break')
    } finally {
      setLoading(false)
    }
  }

  // 권한 처리
  if (hasPermission === null) return <View />
  if (hasPermission === false)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>카메라 및 마이크 권한이 필요합니다</Text>
      </View>
    )

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing={facing} mode="video" />

      {/* 가이드 창 */}
      {phase === 'guide' && (
        <>
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={require('../../../assets/icons/arrow.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.guideBox}>
            <CustomText weight="bold" style={styles.guideTitle}>
              {periodNum}교시 시작까지 {timeLeft}초
            </CustomText>
            <CustomText style={styles.guideText}>
              모든 영상 면접은 피드백을 위해 녹화됩니다.{"\n"}
              위치를 카메라에 잘 보이도록 조정해주세요.{"\n"}
              긴장을 풀고 면접에 집중해주세요.
            </CustomText>
            <CustomText weight="bold" style={styles.guideTime}>
              {timeLeft}
            </CustomText>
          </View>
        </>
      )}

      {/* 질문 표시 */}
      {phase === 'question' && (
        <View style={styles.questionBox}>
          <CustomText weight="bold" style={styles.questionText}>
            {periodNum}교시{"\n"}{question}
          </CustomText>
        </View>
      )}

      {/* 영상 업로드 중 */}
      {phase === 'submitting' && (
        <View style={localStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <CustomText weight="bold" style={localStyles.loadingText}>
            답변을 분석하고 있습니다...
          </CustomText>
        </View>
      )}

      {/* 쉬는시간 */}
      {phase === 'break' && (
        <View style={styles.breakBox}>
          <CustomText weight="bold" style={styles.breakText}>
            {periodNum}교시 완료!
          </CustomText>

          {breakData?.periodFeedbackSummary && (
            <View style={localStyles.summaryBox}>
              <CustomText weight="bold" style={localStyles.summaryScore}>
                이번 교시 점수: {breakData.periodFeedbackSummary.overallScore}점
              </CustomText>
              <CustomText style={localStyles.summaryFeedback}>
                {breakData.periodFeedbackSummary.summaryFeedback}
              </CustomText>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color="#3281FF" style={{ marginTop: 16 }} />
          ) : (
            <>
              {options?.followUpQuestions?.length > 0 && (
                <TouchableOpacity
                  style={[styles.breakButton, styles.breakPrimary]}
                  onPress={handleShowFollowUp}
                >
                  <CustomText weight="bold" style={styles.breakBtnText}>꼬리 질문</CustomText>
                </TouchableOpacity>
              )}

              {options?.newQuestionAvailable && (
                <TouchableOpacity
                  style={[styles.breakButton, styles.breakPrimary]}
                  onPress={handleNewQuestion}
                >
                  <CustomText weight="bold" style={styles.breakBtnText}>새 질문</CustomText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.breakButton, styles.breakDanger]}
                onPress={handleEndInterview}
              >
                <CustomText weight="bold" style={styles.breakBtndangerText}>면접 종료</CustomText>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* 꼬리 질문 선택 */}
      {phase === 'selectFollowUp' && (
        <View style={localStyles.followUpOverlay}>
          <CustomText weight="bold" style={localStyles.followUpTitle}>
            꼬리 질문을 선택하세요
          </CustomText>

          <ScrollView style={localStyles.followUpList}>
            {options?.followUpQuestions?.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={localStyles.followUpItem}
                onPress={() => handleSelectFollowUp(q)}
                disabled={loading}
              >
                <CustomText weight="semibold" style={localStyles.followUpText}>
                  {idx + 1}. {q}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={localStyles.followUpBack}
            onPress={() => setPhase('break')}
            disabled={loading}
          >
            <CustomText style={localStyles.followUpBackText}>← 돌아가기</CustomText>
          </TouchableOpacity>
        </View>
      )}

      {/* 하단 버튼 (guide / question 단계만) */}
      {(phase === 'question' || phase === 'guide') && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setFacing(prev => (prev === 'front' ? 'back' : 'front'))}
          >
            <Image source={require('../../../assets/icons/conversion.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleButton, phase === 'guide' && { opacity: 0.3 }]}
            disabled={phase === 'guide'}
            onPress={handleCheckPress}
          >
            <Image source={require('../../../assets/icons/check.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleButton, phase === 'guide' && { opacity: 0.3 }]}
            disabled={phase === 'guide'}
            onPress={() => setExitModalVisible(true)}
          >
            <Image source={require('../../../assets/icons/exit.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      )}

      {/* 나가기 모달 */}
      {exitModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CustomText weight="bold" style={styles.modalTitle}>
              AI 면접을 그만두시겠어요?
            </CustomText>
            <CustomText style={styles.modalDesc}>
              면접을 그만두면 지금까지{"\n"}녹화한 영상들이 없어져요.
            </CustomText>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalExit]}
                onPress={() => {
                  setExitModalVisible(false)
                  navigation.navigate('Home')
                }}
              >
                <CustomText weight="bold" style={styles.modalExitText}>그만두기</CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setExitModalVisible(false)}
              >
                <CustomText weight="bold" style={styles.modalCancelText}>취소</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const localStyles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  summaryBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 14,
    marginVertical: 12,
    width: '100%',
  },
  summaryScore: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  summaryFeedback: {
    color: '#eee',
    fontSize: 13,
    lineHeight: 20,
  },
  followUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  followUpTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  followUpList: {
    width: '100%',
    maxHeight: 360,
  },
  followUpItem: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  followUpText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  followUpBack: {
    marginTop: 16,
    padding: 10,
  },
  followUpBackText: {
    color: '#aaa',
    fontSize: 14,
  },
})

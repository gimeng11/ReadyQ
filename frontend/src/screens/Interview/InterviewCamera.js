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
  // guide → question → submitting → break → guide (반복)
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

  // 1교시 녹화 남은 시간 (90초)
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(null)

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

  // 녹화 카운트다운 (모든 교시)
  useEffect(() => {
    if (phase !== 'question') return
    setRecordingTimeLeft(90)
    const timer = setInterval(() => {
      setRecordingTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
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
      const result = await cameraRef.current.recordAsync({ maxDuration: 90, videoQuality: 'low' })
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

  // 영상 제출 → 쉬는시간 피드백 (5교시 완료 시 자동 종료)
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await submitPeriodAnswer(sessionId, periodNum, videoUri)
      setBreakData(result)

      if (periodNum >= 5) {
        await completeInterview(sessionId)
        navigation.replace('InterviewEnd', { sessionId })
        return
      }

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

  // 질문 선택 → 다음 교시
  const handleSelectFollowUp = async (selectedQuestion) => {
    setLoading(true)
    try {
      const res = await proceedToNextPeriod(sessionId, periodNum, 'FOLLOW_UP', selectedQuestion)
      setPeriodNum(res.periodNum)
      setQuestion(res.question)
      setOptions(null)
      setBreakData(null)
      setVideoUri(null)
      setRecordingTimeLeft(null)
      setTimeLeft(30)
      setPhase('guide')
    } catch (e) {
      Alert.alert('오류', e.message)
      setPhase('break')
    } finally {
      setLoading(false)
    }
  }

  // 랜덤 질문 선택
  const handleRandomQuestion = () => {
    const questions = options?.followUpQuestions ?? []
    if (questions.length === 0) return
    const randomQ = questions[Math.floor(Math.random() * questions.length)]
    handleSelectFollowUp(randomQ)
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
            {periodNum === 1 ? (
              <CustomText style={styles.guideText}>
                1교시는 1분 30초 이내 자기소개입니다.{"\n"}
                위치를 카메라에 잘 보이도록 조정해주세요.{"\n"}
                긴장을 풀고 자연스럽게 이야기해 주세요.
              </CustomText>
            ) : (
              <CustomText style={styles.guideText}>
                모든 영상 면접은 피드백을 위해 녹화됩니다.{"\n"}
                위치를 카메라에 잘 보이도록 조정해주세요.{"\n"}
                긴장을 풀고 면접에 집중해주세요.
              </CustomText>
            )}
            <CustomText weight="bold" style={styles.guideTime}>
              {timeLeft}
            </CustomText>

            <TouchableOpacity
              style={localStyles.startNowButton}
              onPress={() => setPhase('question')}
            >
              <CustomText weight="bold" style={localStyles.startNowText}>바로시작</CustomText>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 질문 표시 */}
      {phase === 'question' && (
        <View style={styles.questionBox}>
          <CustomText weight="bold" style={styles.questionText}>
            {periodNum}교시{"\n"}{question}
          </CustomText>
          {recordingTimeLeft !== null && (
            <CustomText style={localStyles.recordingTimer}>
              남은 시간: {recordingTimeLeft}초
            </CustomText>
          )}
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
        <View style={localStyles.breakOverlay}>
          <CustomText weight="bold" style={styles.breakText}>
            {periodNum}교시 완료!
          </CustomText>

          {loading ? (
            <ActivityIndicator color="#3281FF" style={{ marginTop: 16 }} />
          ) : (
            <>
              <CustomText weight="semibold" style={localStyles.questionPickTitle}>
                다음 질문을 선택하세요
              </CustomText>

              <ScrollView style={localStyles.questionPickList} showsVerticalScrollIndicator={false}>
                {options?.followUpQuestions?.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={localStyles.questionPickItem}
                    onPress={() => handleSelectFollowUp(q)}
                    disabled={loading}
                  >
                    <CustomText weight="semibold" style={localStyles.questionPickText}>
                      {idx + 1}. {q}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.breakButton, localStyles.randomButton]}
                onPress={handleRandomQuestion}
                disabled={loading}
              >
                <CustomText weight="bold" style={localStyles.randomBtnText}>랜덤 선택</CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.breakButton, styles.breakDanger]}
                onPress={handleEndInterview}
                disabled={loading}
              >
                <CustomText weight="bold" style={styles.breakBtndangerText}>면접 종료</CustomText>
              </TouchableOpacity>
            </>
          )}
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
  recordingTimer: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
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
  breakOverlay: {
    position: 'absolute',
    bottom: 30,
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderRadius: 16,
    padding: 20,
  },
  questionPickTitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionPickList: {
    flex: 1,
    marginBottom: 10,
  },
  questionPickItem: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  questionPickText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 20,
  },
  randomButton: {
    backgroundColor: '#3281FF',
    marginBottom: 8,
  },
  randomBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  startNowButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  startNowText: {
    color: '#fff',
    fontSize: 14,
  },
})

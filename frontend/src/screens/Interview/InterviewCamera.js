import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { CameraView, Camera } from 'expo-camera'
import { styles } from './InterviewCameraStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import LoadingScreen from '../../components/LoadingScreen'
import QuestionSelectScreen from '../../components/QuestionSelect'
import {
  startInterview,
  submitPeriodAnswer,
  getNextOptions,
  proceedToNextPeriod,
} from '../../api/interview'

const INTERVIEWER_TYPE_MAP = {
  basic: 'DEFAULT',
  kind: 'FRIENDLY',
  strict: 'PRESSURE',
  logic: 'LOGIC',
}

export default function InterviewCamera({ navigation, route }) {
  const { selectedType, interviewerType, title } = route.params || {}

  const [hasPermission, setHasPermission] = useState(null)
  const [facing, setFacing] = useState('front')

  const [sessionId, setSessionId] = useState(null)
  const sessionIdRef = useRef(null)

  const [phase, setPhase] = useState('guide')
  const [round, setRound] = useState(1)
  const roundRef = useRef(1)

  const [timeLeft, setTimeLeft] = useState(3)
  const [readyTime, setReadyTime] = useState(10)
  const [answerTime, setAnswerTime] = useState(90)
  const readyTimeRef = useRef(10)
  const answerTimeRef = useRef(90)

  const [question, setQuestion] = useState('')
  const [followUpQuestions, setFollowUpQuestions] = useState([])

  const [exitModalVisible, setExitModalVisible] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = [
    '영상을 분석중이에요.',
    '피드백 생성중이에요.',
    '완료되었어요.',
  ]

  // 녹화 관련 ref
  const cameraRef = useRef(null)
  const isRecordingRef = useRef(false)
  const recordingPromise = useRef(null)
  const actionInProgressRef = useRef(false)

  // 카메라 + 마이크 권한 요청
  useEffect(() => {
    ;(async () => {
      const { status: cam } = await Camera.requestCameraPermissionsAsync()
      const { status: mic } = await Camera.requestMicrophonePermissionsAsync()
      setHasPermission(cam === 'granted' && mic === 'granted')
    })()
  }, [])

  // 면접 세션 시작 (권한 확인 후)
  useEffect(() => {
    if (!hasPermission) return
    const init = async () => {
      try {
        const mappedType = INTERVIEWER_TYPE_MAP[interviewerType] || 'DEFAULT'
        const res = await startInterview({
          interviewerType: mappedType,
          title: title || '면접',
        })
        sessionIdRef.current = res.sessionId
        setSessionId(res.sessionId)
        setQuestion(`1교시\n${res.question}`)
      } catch (e) {
        console.error('면접 시작 실패:', e)
        setQuestion('1교시\n간단한 자기소개 부탁드립니다.')
      }
    }
    init()
  }, [hasPermission])

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

  // 준비 10초 + 답변 90초 타이머 (round가 바뀌어도 재시작)
  useEffect(() => {
    if (phase !== 'question') return

    readyTimeRef.current = 10
    answerTimeRef.current = 90
    setReadyTime(10)
    setAnswerTime(90)

    const tick = setInterval(() => {
      if (readyTimeRef.current > 0) {
        readyTimeRef.current--
        setReadyTime(readyTimeRef.current)
        if (readyTimeRef.current === 0) {
          // 준비 시간 종료 → 녹화 시작
          startVideoRecording()
        }
      } else {
        answerTimeRef.current--
        setAnswerTime(answerTimeRef.current)
        if (answerTimeRef.current <= 0) {
          clearInterval(tick)
          handleNext()
        }
      }
    }, 1000)

    return () => clearInterval(tick)
  }, [phase, round])

  // 녹화 시작 (답변 시간부터)
  const startVideoRecording = () => {
    if (!cameraRef.current || isRecordingRef.current) return
    try {
      isRecordingRef.current = true
      recordingPromise.current = cameraRef.current.recordAsync({
        maxDuration: 95,
      })
    } catch (e) {
      console.error('녹화 시작 오류:', e)
      isRecordingRef.current = false
    }
  }

  // 녹화 중지
  const stopVideoRecording = () => {
    if (!cameraRef.current || !isRecordingRef.current) return
    try {
      cameraRef.current.stopRecording()
    } catch (e) {
      console.error('녹화 중지 오류:', e)
    }
    isRecordingRef.current = false
  }

  // 답변 완료 (타이머 종료 또는 체크 버튼)
  const handleNext = () => {
    stopVideoRecording()
    setPhase('loading')
  }

  // 로딩: 영상 제출 → 피드백 대기
  useEffect(() => {
    if (phase !== 'loading') return

    let mounted = true
    const currentRound = roundRef.current
    const currentSessionId = sessionIdRef.current

    setLoadingStep(0)

    const process = async () => {
      // 녹화 결과 대기
      let videoUri = null
      if (recordingPromise.current) {
        try {
          const recording = await recordingPromise.current
          videoUri = recording?.uri || null
        } catch (e) {
          console.error('녹화 결과 오류:', e)
        }
        recordingPromise.current = null
      }

      if (!mounted) return
      setLoadingStep(1)

      // 영상 제출
      try {
        if (currentSessionId && videoUri) {
          await submitPeriodAnswer(currentSessionId, currentRound, videoUri)
        }
      } catch (e) {
        console.error('영상 제출 오류:', e)
      }

      if (!mounted) return
      setLoadingStep(2)

      if (currentRound >= 5) {
        if (mounted) setPhase('end')
      } else {
        await new Promise(r => setTimeout(r, 600))
        if (mounted) setPhase('break')
      }
    }

    process()
    return () => { mounted = false }
  }, [phase])

  // 쉬는 시간 선택
  const handleBreakAction = async (type) => {
    if (actionInProgressRef.current) return
    actionInProgressRef.current = true

    try {
    if (type === 'end') {
      setPhase('end')
      return
    }

    const currentRound = roundRef.current
    const nextRound = currentRound + 1
    roundRef.current = nextRound
    setRound(nextRound)

    if (selectedType === 'select') {
      // 꼬리질문 목록 조회 후 선택 화면
      try {
        const options = await getNextOptions(sessionIdRef.current, currentRound)
        setFollowUpQuestions(options.followUpQuestions || [])
      } catch (e) {
        console.error('질문 목록 조회 실패:', e)
        setFollowUpQuestions([])
      }
      setPhase('select')
    } else {
      // 랜덤 모드: 자동으로 다음 질문
      try {
        const res = await proceedToNextPeriod(sessionIdRef.current, currentRound, 'NEW_QUESTION')
        setQuestion(`${nextRound}교시\n${res.question}`)
      } catch (e) {
        console.error('다음 질문 조회 실패:', e)
        setQuestion(`${nextRound}교시\n다음 질문입니다.`)
      }
      setPhase('question')
    }
    } finally {
      actionInProgressRef.current = false
    }
  }

  // 질문 선택 (select 모드)
  const handleQuestionSelect = async (selectedQuestion) => {
    const completedPeriod = roundRef.current - 1
    try {
      const res = await proceedToNextPeriod(
        sessionIdRef.current,
        completedPeriod,
        'FOLLOW_UP',
        selectedQuestion
      )
      setQuestion(`${roundRef.current}교시\n${res.question}`)
    } catch (e) {
      console.error('질문 선택 오류:', e)
      setQuestion(`${roundRef.current}교시\n${selectedQuestion}`)
    }
    setPhase('question')
  }

  // 면접 종료 → InterviewEnd 이동
  useEffect(() => {
    if (phase !== 'end') return
    navigation.replace('InterviewEnd', { sessionId: sessionIdRef.current })
  }, [phase])

  // 권한 처리
  if (hasPermission === null) return <View />
  if (hasPermission === false) {
    return (
      <View>
        <Text>카메라 및 마이크 권한이 필요합니다</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        mode="video"
        videoQuality="480p"
      />

      {/* guide */}
      {phase === 'guide' && (
        <>
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require('../../../assets/icons/arrow.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.guideBox}>
            <CustomText weight="bold" style={styles.guideTitle}>
              30초 뒤 면접이 시작돼요.
            </CustomText>

            <CustomText style={styles.guideText}>
              모든 영상 면접은 피드백을 위해 녹화됩니다.{"\n"}
              위치를 카메라에 잘 보이도록 조정해주세요.{"\n"}
              긴장을 풀고 면접에 집중해주세요.
            </CustomText>

            <CustomText weight="bold" style={styles.guideTime}>
              {timeLeft}
            </CustomText>

            <TouchableOpacity
              style={styles.startNowButton}
              onPress={() => setPhase('question')}
            >
              <CustomText weight="bold" style={styles.startNowText}>
                바로 시작
              </CustomText>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* question */}
      {phase === 'question' && (
        <>
          <View style={styles.questionBox}>
            <CustomText weight="bold" style={styles.questionText}>
              {question}
            </CustomText>

            <CustomText weight="bold" style={styles.timeguideText}>
              {readyTime > 0 ? '준비시간 : ' : '딥뱐시간 : '}
            </CustomText>

            <CustomText
              weight="bold"
              style={[
                styles.answerTimer,
                answerTime <= 10 && { color: '#FF4D4F' }
              ]}
            >
              {readyTime > 0 ? readyTime : answerTime}
            </CustomText>
          </View>
        </>
      )}

      {/* select */}
      {phase === 'select' && (
        <QuestionSelectScreen
          round={round}
          questionCandidates={followUpQuestions}
          onSelect={handleQuestionSelect}
        />
      )}

      {/* 하단 버튼 */}
      {(phase === 'question' || phase === 'guide') && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() =>
              setFacing(prev => (prev === 'front' ? 'back' : 'front'))
            }
          >
            <Image
              source={require('../../../assets/icons/conversion.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleButton,
              phase === 'guide' && { opacity: 0.3 }
            ]}
            disabled={phase === 'guide'}
            onPress={handleNext}
          >
            <Image
              source={require('../../../assets/icons/check.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleButton,
              phase === 'guide' && { opacity: 0.3 }
            ]}
            disabled={phase === 'guide'}
            onPress={() => setExitModalVisible(true)}
          >
            <Image
              source={require('../../../assets/icons/exit.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* 종료 확인 모달 */}
      {exitModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CustomText weight="bold" style={styles.modalTitle}>
              AI 면접을 그만두시겠어요?
            </CustomText>

            <CustomText style={styles.modalDesc}>
              면접을 그만두면 지금까지{"\n"}
              녹화한 영상들이 없어져요.
            </CustomText>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalExit]}
                onPress={() => {
                  setExitModalVisible(false)
                  navigation.navigate('Home')
                }}
              >
                <CustomText weight="bold" style={styles.modalExitText}>
                  그만두기
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setExitModalVisible(false)}
              >
                <CustomText weight="bold" style={styles.modalCancelText}>
                  취소
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* loading + break 배경 */}
      {(phase === 'loading' || phase === 'break') && (
        <LoadingScreen
          loadingStep={loadingStep}
          loadingMessages={loadingMessages}
          round={round}
        />
      )}

      {/* break 버튼 */}
      {phase === 'break' && (
        <View style={styles.breakContainer}>
          <CustomButton
            title="다음 교시로"
            type="primary"
            style={styles.breakCustomButton}
            onPress={() => handleBreakAction()}
          />

          <CustomButton
            title="면접 종료"
            type="secondary"
            style={styles.breakCustomButton}
            onPress={() => handleBreakAction('end')}
          />
        </View>
      )}
    </View>
  )
}

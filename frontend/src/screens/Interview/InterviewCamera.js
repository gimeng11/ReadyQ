import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { CameraView, Camera } from 'expo-camera'
import { styles } from './InterviewCameraStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import LoadingScreen from '../../components/LoadingScreen'
import QuestionSelectScreen from '../../components/QuestionSelect'
import {
  startInterview,
  uploadPeriodVideo,
  generatePeriodFeedback,
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

  // 카메라
  const [facing, setFacing] = useState('front')

  // 면접 세션
  const [sessionId, setSessionId] = useState(null)

  // 면접 흐름 관리
  // guide → question → select → loading → break → end
  const [phase, setPhase] = useState('guide')
  const [round, setRound] = useState(1)

  // 가이드 타이머
  const [timeLeft, setTimeLeft] = useState(30)

  // 준비 시간
  const [readyTime, setReadyTime] = useState(10)

  // 답변 제한 시간
  const [answerTime, setAnswerTime] = useState(90)

  // 질문
  const [question, setQuestion] = useState('')

  // 꼬리질문 후보 (select 모드)
  const [followUpQuestions, setFollowUpQuestions] = useState([])

  // exit 버튼 상태
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // 면접 종료 타입
  const [exitType, setExitType] = useState(null)
  // 'normal' | 'forced'

  // exit 버튼 눌렀을 때 멈춤 상태 (Timer 제어)
  const [isPaused, setIsPaused] = useState(false)

  // 녹화 여부
  const [isRecording, setIsRecording] = useState(false)

  // 로딩 단계
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = [
    '영상을 분석중이에요.',
    '피드백 생성중이에요.',
    '완료되었어요.',
  ]

  // 녹화 관련 refs
  const cameraRef = useRef(null)
  const isRecordingRef = useRef(false)
  const recordingPromiseRef = useRef(null)
  const periodQuestionsRef = useRef({}) // { periodNum: questionText }

  // 권한 요청 + 면접 세션 시작
  useEffect(() => {
    ;(async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync()
      try {
        await Camera.requestMicrophonePermissionsAsync()
      } catch {
        // 마이크 권한 API 미지원 시 무시
      }
      setHasPermission(camStatus === 'granted')
      if (camStatus !== 'granted') return

      try {
        const res = await startInterview({
          interviewerType: INTERVIEWER_TYPE_MAP[interviewerType] || 'DEFAULT',
          title: title || '면접',
        })
        setSessionId(res.sessionId)
        const qText = res.question
        setQuestion(`1교시\n${qText}`)
        periodQuestionsRef.current[1] = qText
      } catch (e) {
        Alert.alert('면접 시작 실패', '서버 연결을 확인하고 다시 시도해주세요.', [
          { text: '뒤로가기', onPress: () => navigation.goBack() },
        ])
      }
    })()
  }, [])

  // 가이드 타이머
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

  // question 진입 시 시간 초기화
  useEffect(() => {
    if (phase === 'question') {
      setReadyTime(10)
      setAnswerTime(90)
    }
  }, [phase])

  // 준비 시간 + 답변 시간
  useEffect(() => {
    if (phase !== 'question' || isPaused) return

    const timer = setInterval(() => {

      // 준비 시간 먼저 감소
      if (readyTime > 0) {
        setReadyTime(prev => prev - 1)
        return
      }

      // 준비시간 종료 → 녹화 시작
      if (!isRecordingRef.current) {
        startRecording()
      }

      // 준비 시간 끝나면 답변 시간 감소
      setAnswerTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleNext()
          return 0
        }

        return prev - 1
      })

    }, 1000)

    return () => clearInterval(timer)
  }, [phase, readyTime, isPaused])

  // 녹화 시작
  const startRecording = () => {
    if (!cameraRef.current || isRecordingRef.current) return
    try {
      isRecordingRef.current = true
      setIsRecording(true)
      recordingPromiseRef.current = cameraRef.current.recordAsync({ maxDuration: 95 })
    } catch (e) {
      isRecordingRef.current = false
      setIsRecording(false)
      recordingPromiseRef.current = null
    }
  }

  // 녹화 중지
  const stopRecording = () => {
    if (!isRecordingRef.current || !cameraRef.current) return
    cameraRef.current.stopRecording()
    isRecordingRef.current = false
    setIsRecording(false)
  }

  // 체크 버튼 / 시간 종료
  const handleNext = () => {
    stopRecording()
    setPhase('loading')
  }

  // 로딩 진행 + API 호출
  useEffect(() => {
    if (phase !== 'loading') return

    const curSessionId = sessionId
    const curRound = round
    const curExitType = exitType

    const doLoadingFlow = async () => {
      setLoadingStep(0)

      try {
        if (recordingPromiseRef.current && curSessionId) {
          const recordData = await recordingPromiseRef.current
          recordingPromiseRef.current = null
          const videoUri = recordData?.uri

          if (videoUri) {
            await uploadPeriodVideo(curSessionId, curRound, videoUri)
            setLoadingStep(1)
            await generatePeriodFeedback(curSessionId, curRound)
          }
        }
      } catch (e) {
        console.warn('[InterviewCamera] 피드백 생성 오류:', e.message)
      }

      setLoadingStep(2)

      setTimeout(() => {
        if (curExitType === 'forced') {
          setPhase('end')
        } else {
          setPhase('break')
        }
      }, 1200)
    }

    doLoadingFlow()
  }, [phase, sessionId, round, exitType])

  // 쉬는 시간 액션
  const handleBreakAction = async (type) => {
    if (type === 'end') {
      setPhase('end')
      return
    }

    if (selectedType === 'select') {
      try {
        const options = await getNextOptions(sessionId, round)
        setFollowUpQuestions(options.followUpQuestions || [])
      } catch (e) {
        setFollowUpQuestions([])
      }
      setPhase('select')
      return
    }

    // 랜덤: NEW_QUESTION 자동 진행
    try {
      const res = await proceedToNextPeriod(sessionId, round, 'NEW_QUESTION')
      const qText = res.question
      setRound(res.periodNum)
      setQuestion(`${res.periodNum}교시\n${qText}`)
      periodQuestionsRef.current[res.periodNum] = qText
    } catch (e) {
      const nextRound = round + 1
      setRound(nextRound)
      setQuestion(`${nextRound}교시\n다음 질문을 준비해주세요.`)
    }
    setPhase('question')
  }

  // 질문 직접 선택 (select 모드)
  const handleQuestionSelect = async (selectedQuestion) => {
    try {
      const res = await proceedToNextPeriod(sessionId, round, 'FOLLOW_UP', selectedQuestion)
      const qText = res.question
      setRound(res.periodNum)
      setQuestion(`${res.periodNum}교시\n${qText}`)
      periodQuestionsRef.current[res.periodNum] = qText
    } catch (e) {
      const nextRound = round + 1
      setRound(nextRound)
      setQuestion(`${nextRound}교시\n${selectedQuestion}`)
      periodQuestionsRef.current[nextRound] = selectedQuestion
    }
    setPhase('question')
  }

  // 종료
  useEffect(() => {
    if (phase === 'end') {
      navigation.replace('InterviewEnd', {
        sessionId,
        periodQuestions: periodQuestionsRef.current,
      })
    }
  }, [phase])

  // 카메라 권한 처리
  if (hasPermission === null) return <View />

  if (hasPermission === false) {
    return (
      <View>
        <Text>카메라 권한이 필요합니다</Text>
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
              {readyTime > 0 ? '준비시간 : ' : '답변시간 : '}
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
          round={round + 1}
          questionCandidates={followUpQuestions.length > 0 ? followUpQuestions : ['질문을 불러오는 중이에요...']}
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
              (phase === 'guide' || readyTime > 0) && { opacity: 0.3 }
            ]}
            disabled={phase === 'guide'|| readyTime > 0}
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
            onPress={() => {
              setExitModalVisible(true)
              setIsPaused(true)
              setExitType('forced')
            }}
          >
            <Image
              source={require('../../../assets/icons/exit.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* 모달 */}
      {exitModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CustomText weight="bold" style={styles.modalTitle}>
              AI 면접을 그만두시겠어요?
            </CustomText>

            <CustomText style={styles.modalDesc}>
              면접을 그만두면 진행한 부분만 피드백에 반영돼요.{"\n"}
              답변을 중단할 시 피드백의 정확도가 떨어질 수 있어요.
            </CustomText>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalExit]}
                onPress={() => {
                  setExitModalVisible(false)
                  setIsPaused(false)
                  stopRecording()
                  setExitType('forced')
                  setPhase('loading')
                }}
              >
                <CustomText weight="bold" style={styles.modalExitText}>
                  그만두기
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setExitModalVisible(false)
                  setIsPaused(false)
                  setExitType(null)
                }}
              >
                <CustomText weight="bold" style={styles.modalCancelText}>
                  취소
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* loading + break */}
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

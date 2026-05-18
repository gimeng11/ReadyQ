import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { CameraView, Camera } from 'expo-camera'
import { styles } from './InterviewCameraStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import LoadingScreen from '../../components/LoadingScreen'
import QuestionSelectScreen from '../../components/QuestionSelect'

export default function InterviewCamera({ navigation, route }) {

  const { selectedType } = route.params || {}

  const [hasPermission, setHasPermission] = useState(null)

  // 카메라
  const [facing, setFacing] = useState('front')

  // 면접 흐름 관리
  // guide → question → select → loading → break → end
  const [phase, setPhase] = useState('guide')
  const [round, setRound] = useState(1)

  // 가이드 타이머
  const [timeLeft, setTimeLeft] = useState(3)

  // 준비 시간
  const [readyTime, setReadyTime] = useState(10)

  // 답변 제한 시간
  const [answerTime, setAnswerTime] = useState(90)

  // 질문
  const [question, setQuestion] = useState('')

  const questionCandidates = [
    '최근 협업 경험에 대해 설명해주세요.',
    '가장 어려웠던 문제 해결 경험은 무엇인가요?',
    '본인의 강점은 무엇이라고 생각하시나요?',
    '실패했던 경험과 극복 과정을 말해주세요.',
    '지원 직무에 관심을 가지게 된 계기는 무엇인가요?',
  ]

  // exit 버튼 상태
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // 로딩 단계
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingMessages = [
    '영상을 분석중이에요.',
    '피드백 생성중이에요.',
    '완료되었어요.',
  ]

  // 카메라 권한
  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
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
    if (phase !== 'question') return

    const timer = setInterval(() => {

      // 준비 시간 먼저 감소
      if (readyTime > 0) {
        setReadyTime(prev => prev - 1)
        return
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
  }, [phase, readyTime])

  // 질문 호출
  useEffect(() => {
    if (phase !== 'question') return

    // 1교시는 고정 자기소개
    if (round === 1 && question === '') {
      setQuestion('1교시\n간단한 자기소개 부탁드립니다.')
      return
    }

    // 랜덤 질문 모드
    if (
      selectedType === 'random' &&
      round !== 1 &&
      question === ''
    ) {
      const randomIndex = Math.floor(
        Math.random() * questionCandidates.length
      )

      setQuestion(
        `${round}교시\n${questionCandidates[randomIndex]}`
      )
    }
  }, [phase, round])

  // 질문 이동
  const handleBreakAction = (type) => {
    if (type === 'end') {
      setPhase('end')
      return
    }

    const nextRound = round + 1

    setRound(nextRound)
    setQuestion('')

    // 질문 직접 선택
    if (selectedType === 'select') {
      setPhase('select')
      return
    }

    // 랜덤 질문
    setPhase('question')
  }

  // 체크 버튼
  const handleNext = () => {
    setPhase('loading')
  }

  // 로딩 진행
  useEffect(() => {
    if (phase !== 'loading') return

    setLoadingStep(0)

    const timer1 = setTimeout(() => {
      setLoadingStep(1)
    }, 1500)

    const timer2 = setTimeout(() => {
      setLoadingStep(2)

      if (round >= 5) {
        setTimeout(() => {
          setPhase('end')
        }, 2000)
      } else {
        setPhase('break')
      }
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [phase])

  // 종료
  useEffect(() => {
    if (phase === 'end') {
      navigation.replace('InterviewEnd')
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
        style={StyleSheet.absoluteFillObject}
        facing={facing}
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
          questionCandidates={questionCandidates}
          onSelect={(item) => {
            setQuestion(`${round}교시\n${item}`)
            setPhase('question')
          }}
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

      {/* 모달 */}
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
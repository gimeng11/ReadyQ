import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { CameraView, Camera } from 'expo-camera'
import { styles } from './InterviewCameraStyles'
import CustomText from '../../components/CustomText'

export default function InterviewCamera({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null)

  // 카메라
  const [facing, setFacing] = useState('front')

  // 면접 흐름 관리
  const [phase, setPhase] = useState('guide') // guide → question → break → end
  const [round, setRound] = useState(1)

  // 가이드 창 타이머 (30초)
  const [timeLeft, setTimeLeft] = useState(3)

  // 질문
  const [question, setQuestion] = useState('')

  // exit 버튼 상태 관리
  const [exitModalVisible, setExitModalVisible] = useState(false)

  // 카메라 권한
  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  // 가이드 창 타이머
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

  // 1교시 질문 호출
  useEffect(() => {
    if (phase === 'question' && round === 1) {
      setQuestion('1교시\n간단한 자기소개 부탁드립니다.')
    }
  }, [phase])

  // 질문 (1교시 질문은 고정, 나머지는 AI 생성)
  const handleBreakAction = async (type) => {
    if (type === 'end') {
      setPhase('end')
      return
    }

    const nextRound = round + 1

    let newQuestion = ''

    if (nextRound === 1) {
      newQuestion = '1교시\n간단한 자기소개 부탁드립니다.'
    } else { //추후 AI 로직으로 수정 필요
      if (type === 'follow') {
        newQuestion = `${nextRound}교시\n(꼬리 질문)`
      } else {
        newQuestion = `${nextRound}교시\n(새 질문)`
      }
    }

    setRound(nextRound)
    setQuestion(newQuestion)
    setPhase('question')
  }

  // 교시 끝난 후 
  const handleNext = () => {
    if (round >= 5) {
      setPhase('end')
      return
    }

    setPhase('break')
  }

  //면접 종료, 5교시 끝났을 때
  useEffect(() => {
  if (phase === 'end') {
    navigation.replace('InterviewEnd') //테스트 후 replace로 수정 예정.
  }
}, [phase])

  // 카메라 권한 처리
  if (hasPermission === null) return <View />
  if (hasPermission === false)
    return (
      <View>
        <Text>카메라 권한이 필요합니다</Text>
      </View>
    )

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />

      {/* 가이드 창 떠있을 때(guide 상태)만 backbutton 출력 */}
      {phase === 'guide' && (
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
      )}

      {/* 가이드 창 */}
      {phase === 'guide' && (
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
        </View>
      )}

      {/* 🔵 질문 */}
      {phase === 'question' && (
        <View style={styles.questionBox}>
          <CustomText weight="bold" style={styles.questionText}>
            {question}
          </CustomText>
        </View>
      )}

      {/* 쉬는시간 */}
      {phase === 'break' && (
        <View style={styles.breakBox}>
          <CustomText weight="bold" style={styles.breakText}>
            다음 질문으로 넘어가시겠습니까?
          </CustomText>

          <TouchableOpacity
            style={[styles.breakButton, styles.breakPrimary]}
            onPress={() => handleBreakAction('follow')}
          >
            <CustomText weight="bold" style={styles.breakBtnText}>꼬리 질문</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.breakButton, styles.breakPrimary]}
            onPress={() => handleBreakAction('new')}
          >
            <CustomText weight="bold" style={styles.breakBtnText}>다음 질문</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.breakButton, styles.breakDanger]}
            onPress={() => handleBreakAction('end')}
          >
            <CustomText weight="bold" style={styles.breakBtndangerText}>면접 종료</CustomText>
          </TouchableOpacity>
        </View>
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

      {/*exitbutton 눌렀을 때 모달창*/}
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
                  //DB 삭제 로직 작성
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
import { View, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { styles } from './InterviewEndStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import { completeInterview } from '../../api/interview'

export default function InterviewEnd({ navigation, route }) {
  const { sessionId, periodQuestions } = route.params ?? {}
  const [completing, setCompleting] = useState(false)

  const handleViewFeedback = async () => {
    if (sessionId) {
      setCompleting(true)
      try {
        await completeInterview(sessionId)
      } catch (_) {
        // 이미 완료된 세션이면 무시
      } finally {
        setCompleting(false)
      }
    }
    navigation.replace('Feedback', {
      sessionId,
      periodQuestions,
      from: 'InterviewEnd',
    })
  }

  if (completing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#281FF" />
        <CustomText style={{ marginTop: 16, color: '#666' }}>피드백을 생성하고 있어요...</CustomText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.TextSection}>
        <CustomText weight="bold" style={styles.label1}>
          모든 면접이 끝났어요.
        </CustomText>

        <CustomText weight="semibold" style={styles.label2}>
          면접 피드백을 받으러 갈까요?
        </CustomText>
      </View>

      <View style={styles.bottomSection}>
        <CustomButton
          title="피드백 보러가기"
          type="primary"
          style={styles.buttonLeft}
          onPress={handleViewFeedback}
        />

        <CustomButton
          title="홈으로 이동하기"
          type="secondary"
          style={styles.buttonRight}
          onPress={() => navigation.replace('Home')}
        />
      </View>
    </View>
  )
}

import { View } from 'react-native'
import { styles } from './InterviewEndStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import { completeInterview } from '../../api/interview'

export default function InterviewEnd({ navigation, route }) {
  const { sessionId } = route.params ?? {}

  const handleViewFeedback = async () => {
    // 아직 complete 안 됐을 경우 (조기 종료 시) 여기서 처리
    if (sessionId) {
      try {
        await completeInterview(sessionId)
      } catch (e) {
        // 이미 완료된 경우 무시
      }
    }
    navigation.replace('Feedback', {
      sessionId,
      from: 'InterviewEnd',
    })
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

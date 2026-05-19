import { View } from 'react-native'
import { styles } from './InterviewEndStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'

export default function InterviewEnd({ navigation, route }) {
  const { sessionId } = route.params ?? {}

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
          onPress={() =>
            navigation.replace('Feedback', {
              sessionId,
              from: 'InterviewEnd',
            })
          }
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
import { View } from 'react-native'
import { styles } from './QuestionSelectStyles'
import CustomButton from './CustomButton'
import CustomText from './CustomText'

export default function QuestionSelect({
  round,
  questionCandidates,
  onSelect,
}) {
  return (
    <View style={styles.container}>
      <CustomText weight="bold" style={styles.title}>
        {round}교시 질문을 선택해주세요.
      </CustomText>

      <View style={styles.buttonContainer}>
        {questionCandidates.map((item, index) => (
          <CustomButton
            key={index}
            title={item}
            type="secondary"
            style={styles.button}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
    </View>
  )
}
import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from './QuestionSelectStyles'
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
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              index === questionCandidates.length - 1 && { marginBottom: 0 },
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.buttonText} numberOfLines={3}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

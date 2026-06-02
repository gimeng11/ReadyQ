import { TouchableOpacity, Text } from 'react-native'
import { styles } from './CustomButtonStyles'

export default function CustomButton({
  title,
  onPress,
  type = 'primary',
  style,
}) {
  const isPrimary = type === 'primary'

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}
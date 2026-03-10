import { View, TouchableOpacity, Image } from 'react-native'
import CustomText from './CustomText'
import { styles } from './HeaderStyles'

export default function Header({ title, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>

      <CustomText weight="bold" style={styles.title}>
        {title}
      </CustomText>
    </View>
  )
}
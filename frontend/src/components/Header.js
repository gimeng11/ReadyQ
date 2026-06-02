import { View, TouchableOpacity, Image } from 'react-native'
import CustomText from './CustomText'
import { styles } from './HeaderStyles'

export default function Header({
  title,
  onBack,
  onHome,
  icon,
  showHome = false,
}) {
  return (
    <View style={styles.container}>

      {/* 왼쪽 버튼 영역 */}
      <View style={styles.leftSection}>

        {/* 뒤로가기 버튼 (있을 때만 렌더링) */}
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Image
              source={require('../../assets/icons/arrow.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>
        )}

        {/* 홈 버튼 (옵션) */}
        {showHome && (
          <TouchableOpacity
            style={styles.homeButton}
            onPress={onHome}
          >
            <Image
              source={icon || require('../../assets/icons/home2.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>
        )}

      </View>

      {/* 타이틀 */}
      <CustomText weight="bold" style={styles.title}>
        {title}
      </CustomText>

    </View>
  )
}
import { View, Image } from 'react-native'
import CustomText from './CustomText'
import { styles } from './LoadingStyles'

export default function LoadingScreen({
  loadingStep,
  loadingMessages,
  round,
}) {

  return (
    <View style={styles.loadingBox}>

      {/* 진행 바 영역 */}
      <View style={styles.progressWrapper}>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(round / 5) * 100}%` }
            ]}
          />
        </View>

        <CustomText weight="bold" style={styles.progressText}>
          {round}/5
        </CustomText>

      </View>

      {/* 로고 / 완료 아이콘 */}
      <View style={styles.logoContainer}>
        <Image
          source={
            loadingStep === 2
              ? require('../../assets/icons/outline_check.png')
              : require('../../assets/icons/Logo_gray.png')
          }
          style={
            loadingStep === 2
              ? styles.completeIcon
              : styles.loadingLogo
          }
        />
      </View>

      {/* 문구 */}
      <CustomText weight="bold" style={styles.loadingText}>
        {loadingMessages[loadingStep]}
      </CustomText>

    </View>
  )
}
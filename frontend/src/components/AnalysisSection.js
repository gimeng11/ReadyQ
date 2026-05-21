import { View } from 'react-native'
import CustomText from './CustomText'
import { styles } from './AnalysisSectionStyles'

export default function AnalysisSection({ title, items, showDivider }) {
  return (
    <View style={styles.container}>
      
      {/* 제목 */}
      <CustomText weight="bold" style={styles.title}>
        {title}
      </CustomText>

      {/* 내용 */}
      {items.length === 0 ? (
        <CustomText style={styles.emptyText}>
          분석 결과가 없습니다.
        </CustomText>
      ) : (
        items.map((item, index) => (
          <View style={styles.row} key={index}>
            <CustomText style={styles.bullet}>•</CustomText>
            <CustomText weight="medium" style={styles.itemText}>
              {item}
            </CustomText>
          </View>
        ))
      )}

      {/* 구분선 */}
      {showDivider && <View style={styles.divider} />}
    </View>
  )
}
import { View, Image, ScrollView } from 'react-native';
import { styles } from './FeedbackDetailStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'

export default function FeedbackDetail({ navigation, route }) {
  const { competency, periodFeedbacks = [] } = route.params ?? {}
  const { key: competencyKey, title, subtitle, score, icon } = competency ?? {}

  const getGradeInfo = (s) => {
    if (s >= 90) return { label: '우수', color: '#3281FF' }
    if (s >= 70) return { label: '양호', color: '#22C55E' }
    if (s >= 50) return { label: '보통', color: '#ff8630' }
    if (s >= 30) return { label: '주의', color: '#EAB308' }
    return { label: '부족', color: '#ff4848' }
  }

  const gradeInfo = getGradeInfo(score ?? 0)

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        onHome={() => navigation.navigate('Home')}
        showHome={true}
        icon={require('../../../assets/icons/home2.png')}
        title="세부 피드백"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topCard}>
          <View style={styles.topRow}>
            <View style={styles.iconBox}>
              {icon && <Image source={icon} style={styles.icon} />}
            </View>
            <View style={styles.topTextBox}>
              <CustomText weight="bold" style={styles.competencyTitle}>
                {title}
              </CustomText>
              <View style={styles.scoreRow}>
                <CustomText weight="bold" style={[styles.scoreText, { color: gradeInfo.color }]}>
                  {score}%
                </CustomText>
                <View style={[styles.gradeBadge, { backgroundColor: `${gradeInfo.color}20` }]}>
                  <CustomText weight="bold" style={[styles.gradeText, { color: gradeInfo.color }]}>
                    {gradeInfo.label}
                  </CustomText>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${score ?? 0}%`, backgroundColor: gradeInfo.color },
              ]}
            />
          </View>
        </View>

        {!!subtitle && (
          <View style={styles.descCard}>
            <CustomText weight="bold" style={styles.descTitle}>역량 분석</CustomText>
            <CustomText style={styles.descText}>{subtitle}</CustomText>
          </View>
        )}

        {periodFeedbacks.length > 0 && !!competencyKey && (
          <View style={styles.periodCard}>
            <CustomText weight="bold" style={styles.periodTitle}>교시별 점수</CustomText>
            {periodFeedbacks.map((pf, index) => {
              const periodScore = pf?.scores?.[competencyKey] ?? null
              const pg = periodScore != null ? getGradeInfo(periodScore) : null
              return (
                <View key={index} style={styles.periodRow}>
                  <CustomText weight="medium" style={styles.periodLabel}>
                    {index + 1}교시
                  </CustomText>
                  <View style={styles.periodBarBg}>
                    <View
                      style={[
                        styles.periodBarFill,
                        { width: `${periodScore ?? 0}%`, backgroundColor: pg?.color ?? '#ccc' },
                      ]}
                    />
                  </View>
                  <CustomText weight="bold" style={[styles.periodScore, { color: pg?.color ?? '#999' }]}>
                    {periodScore != null ? `${periodScore}%` : '-'}
                  </CustomText>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

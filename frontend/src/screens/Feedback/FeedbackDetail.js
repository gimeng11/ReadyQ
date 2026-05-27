import { View, ScrollView } from 'react-native'
import { styles } from './FeedbackDetailStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'

const competencyMap = {
  logic: '논리 구조력',
  speed: '속도 조절력',
  fluency: '발화 유창성',
  nonverbal: '비언어 표현력',
  persuasion: '전달 설득력',
}

const getGradeInfo = (score) => {
  if (score >= 90) return { label: '우수', color: '#3281FF' }
  if (score >= 70) return { label: '양호', color: '#22C55E' }
  if (score >= 50) return { label: '보통', color: '#ff8630' }
  if (score >= 30) return { label: '주의', color: '#EAB308' }
  return { label: '부족', color: '#ff4848' }
}

export default function FeedbackDetail({ navigation, route }) {

  const { competencyId, competencyBackendKeys, periodFeedbacks } = route.params

  const title = competencyMap[competencyId] ?? '데이터 없음'
  const backendKeys = competencyBackendKeys || [competencyId]

  // 교시별 세부 데이터 생성
  const detailItems = (periodFeedbacks || []).map((pf, i) => {
    const scores = backendKeys.map(k => pf.scores?.[k] ?? 0)
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    const weakness = backendKeys
      .map(k => pf.detailFeedback?.[k])
      .filter(Boolean)
      .join(' ') || pf.summaryFeedback || '-'

    const improvement = pf.improvementTips?.[0] || '-'

    return {
      title: `${i + 1}교시`,
      score: avgScore,
      weakness,
      improvement,
    }
  })

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        onHome={() => navigation.navigate('Home')}
        showHome={true}
        icon={require('../../../assets/icons/home2.png')}
        title="세부 피드백"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <CustomText weight="bold" style={styles.titleText}>
          {title}
        </CustomText>

        <View style={styles.divider} />

        {detailItems.length === 0 ? (
          <CustomText style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>
            피드백 데이터가 없어요.
          </CustomText>
        ) : (
          detailItems.map((item, index) => {

            const gradeInfo = getGradeInfo(item.score)

            return (
              <View key={index} style={styles.graphCard}>

                {/* 상단 */}
                <View style={styles.topRow}>

                  <CustomText weight="bold" style={styles.graphTitle}>
                    {item.title}
                  </CustomText>

                  <View style={styles.scoreRow}>

                    <CustomText
                      weight="bold"
                      style={[
                        styles.graphScore,
                        { color: gradeInfo.color }
                      ]}
                    >
                      {item.score}%
                    </CustomText>

                    <View
                      style={[
                        styles.gradeBadge,
                        { backgroundColor: `${gradeInfo.color}20` }
                      ]}
                    >
                      <CustomText
                        weight="bold"
                        style={[
                          styles.gradeText,
                          { color: gradeInfo.color }
                        ]}
                      >
                        {gradeInfo.label}
                      </CustomText>
                    </View>

                  </View>

                </View>

                {/* 그래프 */}
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.score}%`,
                        backgroundColor: gradeInfo.color,
                      }
                    ]}
                  />
                </View>

                {/* 아쉬운 점 */}
                <View style={styles.feedbackSection}>
                  <CustomText weight="bold" style={styles.feedbackTitle}>
                    아쉬운 점
                  </CustomText>

                  <CustomText style={styles.feedbackText}>
                    {item.weakness}
                  </CustomText>
                </View>

                {/* 개선할 점 */}
                <View style={styles.feedbackSection}>
                  <CustomText weight="bold" style={styles.feedbackTitle}>
                    개선할 점
                  </CustomText>

                  <CustomText style={styles.feedbackText}>
                    {item.improvement}
                  </CustomText>
                </View>

              </View>
            )
          })
        )}

      </ScrollView>
    </View>
  )
}

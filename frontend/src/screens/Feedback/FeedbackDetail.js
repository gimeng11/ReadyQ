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

// 역량별 세부 항목 → 백엔드 점수 키 매핑
const COMPETENCY_DETAIL_CONFIG = {
  logic: [
    { title: '논리 구조', key: 'logicStructure' },
    { title: '답변 명확성', key: 'answerClarity' },
  ],
  speed: [
    { title: '말하기 속도', key: 'speechSpeed' },
  ],
  fluency: [
    { title: '추임새 빈도', key: 'fillerWords' },
  ],
  nonverbal: [
    { title: '시선 처리', key: 'eyeContact' },
  ],
  persuasion: [
    { title: '목소리 전달력', key: 'voiceVolume' },
  ],
}

const getGradeInfo = (score) => {
  if (score >= 90) return { label: '우수', color: '#3281FF' }
  if (score >= 70) return { label: '양호', color: '#22C55E' }
  if (score >= 50) return { label: '보통', color: '#ff8630' }
  if (score >= 30) return { label: '주의', color: '#EAB308' }
  return { label: '부족', color: '#ff4848' }
}

export default function FeedbackDetail({ navigation, route }) {

  const { competencyId, periodFeedbacks } = route.params

  const title = competencyMap[competencyId] ?? '데이터 없음'
  const subItems = COMPETENCY_DETAIL_CONFIG[competencyId] ?? []
  const periods = periodFeedbacks || []

  // 세부 항목별: 전 교시 평균 점수 + 가장 최근 교시 피드백 텍스트
  const detailItems = subItems.map(cfg => {
    const scores = periods.map(pf => pf.scores?.[cfg.key] ?? 0)
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    const lastWithDetail = [...periods].reverse().find(pf => pf.detailFeedback?.[cfg.key])
    const weakness = lastWithDetail?.detailFeedback?.[cfg.key] || '-'

    const lastWithTips = [...periods].reverse().find(pf => pf.improvementTips?.length)
    const improvement = lastWithTips?.improvementTips?.[0] || '-'

    return { title: cfg.title, score: avgScore, weakness, improvement }
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

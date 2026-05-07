import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useState, useEffect } from 'react'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'
import { getSessionFeedback } from '../../api/interview'

// PeriodFeedback.scores 키 → 역량 이름 매핑
const SCORE_KEYS = [
  { key: 'logicStructure', title: '논리 구조력', subtitle: '답변 구조', icon: require('../../../assets/icons/logic.png') },
  { key: 'speechSpeed',    title: '속도 조절력', subtitle: '말하기 속도 · 음성 크기', icon: require('../../../assets/icons/time.png') },
  { key: 'fillerWords',    title: '발화 유창성', subtitle: '추임새 빈도 · 말 끊김', icon: require('../../../assets/icons/mouth.png') },
  { key: 'eyeContact',     title: '비언어 표현력', subtitle: '시선 처리 · 표정 · 자세', icon: require('../../../assets/icons/person.png') },
  { key: 'answerClarity',  title: '전달 설득력', subtitle: '목소리 톤 · 억양 · 강조', icon: require('../../../assets/icons/mic.png') },
]

const getGradeInfo = (score) => {
  if (score >= 90) return { label: '우수', color: '#3281FF' }
  if (score >= 70) return { label: '양호', color: '#22C55E' }
  if (score >= 50) return { label: '보통', color: '#ff8630' }
  if (score >= 30) return { label: '주의', color: '#EAB308' }
  return { label: '부족', color: '#ff4848' }
}

// 교시별 피드백에서 역량 키의 평균 점수 계산
const calcAvgScore = (periodFeedbacks, key) => {
  const values = periodFeedbacks
    .map(p => p.scores?.[key])
    .filter(v => typeof v === 'number')
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export default function FeedbackScreen({ navigation, route }) {
  const { sessionId } = route.params ?? {}
  const [activeTab, setActiveTab] = useState('overall')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      try {
        const res = await getSessionFeedback(sessionId)
        setFeedbackData(res)
      } catch (e) {
        Alert.alert('오류', e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3281FF" />
        <CustomText style={{ marginTop: 12, color: '#555' }}>피드백을 불러오는 중...</CustomText>
      </View>
    )
  }

  const final = feedbackData?.finalFeedback
  const periodFeedbacks = feedbackData?.periodFeedbacks ?? []

  // 역량 데이터 (교시별 평균)
  const competencyData = SCORE_KEYS.map(item => ({
    ...item,
    score: calcAvgScore(periodFeedbacks, item.key),
  }))

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.navigate('Home')}
        icon={require('../../../assets/icons/home2.png')}
        title=" 면접 피드백"
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('overall')} style={styles.tabItem}>
          <CustomText weight="bold" style={[styles.tabText, activeTab === 'overall' && styles.activeTabText]}>
            종합 피드백
          </CustomText>
          {activeTab === 'overall' && <View style={styles.underline} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('each')} style={styles.tabItem}>
          <CustomText weight="bold" style={[styles.tabText, activeTab === 'each' && styles.activeTabText]}>
            영상별 피드백
          </CustomText>
          {activeTab === 'each' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'overall' && (
          <View style={styles.contentContainer}>
            {/* 점수 섹션 */}
            <View style={styles.scoreContainer}>
              <CustomText weight="bold" style={styles.scoreTitle}>
                면접 결과
              </CustomText>

              <View style={styles.scoreRow}>
                <CustomText weight="bold" style={styles.AIscore}>
                  {final?.totalScore ?? '-'}점
                </CustomText>
                <CustomText weight="bold" style={styles.totalscore}>
                  {' /100점'}
                </CustomText>
              </View>

              {final?.comparisonWithPrev && (
                <View style={styles.compareBox}>
                  <View style={styles.compareRow}>
                    <CustomText weight="medium" style={styles.compareLabel}>
                      직전 면접 대비
                    </CustomText>
                    <CustomText weight="bold" style={styles.compareValue}>
                      {final.comparisonWithPrev}
                    </CustomText>
                  </View>
                </View>
              )}
            </View>

            {/* 구분선 */}
            <View style={{ marginHorizontal: -20 }}>
              <View style={styles.divider} />
            </View>

            {/* 분석 결과 */}
            {(final?.strongPoints?.length > 0 || final?.improvementPoints?.length > 0) && (
              <View style={styles.analysisContainer}>
                <CustomText weight="bold" style={styles.analysisTitle}>
                  분석 결과
                </CustomText>

                {final?.strongPoints?.length > 0 && (
                  <AnalysisSection
                    title="답변의 강점"
                    items={final.strongPoints}
                    showDivider={final?.improvementPoints?.length > 0}
                  />
                )}

                {final?.improvementPoints?.length > 0 && (
                  <AnalysisSection
                    title="개선할 점"
                    items={final.improvementPoints}
                    showDivider={false}
                  />
                )}
              </View>
            )}

            {/* 총평 */}
            {final?.overallSummary && (
              <>
                <View style={{ marginHorizontal: -20 }}>
                  <View style={styles.divider} />
                </View>
                <View style={{ paddingVertical: 16 }}>
                  <CustomText weight="bold" style={styles.analysisTitle}>총평</CustomText>
                  <CustomText style={{ fontSize: 14, color: '#444', lineHeight: 22, marginTop: 8 }}>
                    {final.overallSummary}
                  </CustomText>
                </View>
              </>
            )}

            {/* 구분선 */}
            <View style={{ marginHorizontal: -20 }}>
              <View style={styles.divider} />
            </View>

            {/* 역량 */}
            <View style={styles.competencyContainer}>
              <CustomText weight="bold" style={styles.competencyTitle}>
                총 면접 역량
              </CustomText>

              {competencyData.map((item, index) => {
                const gradeInfo = getGradeInfo(item.score)
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.competencyItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('FeedbackDetail', { competency: item, sessionId })}
                  >
                    <View style={styles.iconBox}>
                      <Image source={item.icon} style={styles.icon} />
                    </View>

                    <View style={styles.textBox}>
                      <View style={styles.titleRow}>
                        <CustomText weight="bold" style={styles.mainText}>{item.title}</CustomText>
                        <Image source={require('../../../assets/icons/arrow2.png')} style={styles.infoIcon} />
                      </View>
                      <CustomText style={styles.subText}>{item.subtitle}</CustomText>
                    </View>

                    <View style={styles.scoreBox}>
                      <CustomText weight="bold" style={[styles.scoreText, { color: gradeInfo.color }]}>
                        {item.score}%
                      </CustomText>
                      <View style={[styles.gradeBox, { backgroundColor: `${gradeInfo.color}20` }]}>
                        <CustomText weight="bold" style={[styles.gradeText, { color: gradeInfo.color }]}>
                          {gradeInfo.label}
                        </CustomText>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {activeTab === 'each' && (
          <View>
            {periodFeedbacks.length === 0 ? (
              <CustomText style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                교시별 피드백이 없습니다.
              </CustomText>
            ) : (
              periodFeedbacks.map((pf, idx) => (
                <View key={idx} style={{ marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                  <CustomText weight="bold" style={{ fontSize: 16, marginBottom: 8, color: '#222' }}>
                    {idx + 1}교시 — {pf.overallScore}점
                  </CustomText>
                  <CustomText style={{ fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 8 }}>
                    {pf.summaryFeedback}
                  </CustomText>
                  {pf.improvementTips?.length > 0 && (
                    <>
                      <CustomText weight="semibold" style={{ fontSize: 13, color: '#3281FF', marginBottom: 4 }}>
                        개선 팁
                      </CustomText>
                      {pf.improvementTips.map((tip, tidx) => (
                        <CustomText key={tidx} style={{ fontSize: 13, color: '#444', lineHeight: 20 }}>
                          • {tip}
                        </CustomText>
                      ))}
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

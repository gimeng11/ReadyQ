import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'
import { getSessionFeedback } from '../../api/interview'

// 역량 키 → 한글 라벨 + 아이콘 매핑
const COMPETENCY_CONFIG = [
  { key: 'logicStructure', title: '논리 구조력', icon: require('../../../assets/icons/logic.png') },
  { key: 'speechSpeed',    title: '속도 조절력', icon: require('../../../assets/icons/time.png') },
  { key: 'fillerWords',    title: '발화 유창성', icon: require('../../../assets/icons/mouth.png') },
  { key: 'eyeContact',     title: '비언어 표현력', icon: require('../../../assets/icons/person.png') },
  { key: 'voiceVolume',    title: '전달 설득력', icon: require('../../../assets/icons/mic.png') },
]

export default function FeedbackScreen({ navigation, route }) {
  const { sessionId, from } = route.params ?? {}

  const [activeTab, setActiveTab] = useState('overall')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    getSessionFeedback(sessionId)
      .then(data => setFeedbackData(data))
      .catch(e => console.error('피드백 조회 실패:', e))
      .finally(() => setLoading(false))
  }, [sessionId])

  const ff = feedbackData?.finalFeedback

  const analysisData = {
    strengths: ff?.strongPoints || [],
    weaknesses: ff?.weakPoints || [],
    improvements: ff?.improvementPoints || [],
  }

  const competencyData = COMPETENCY_CONFIG.map(({ key, title, icon }) => ({
    key,
    title,
    subtitle: ff?.competencyShortDescriptions?.[key] || '',
    score: ff?.competencyScores?.[key] ?? 0,
    icon,
  }))

  const totalScore = ff?.totalScore ?? null
  const prevScore = ff?.prevSessionScore ?? null
  const firstScore = ff?.firstSessionScore ?? null

  const formatComp = (score) => {
    if (score == null || totalScore == null) return '-'
    const diff = totalScore - score
    return `${diff > 0 ? '+' : ''}${diff}점 (${score}점)`
  }

  const getGradeInfo = (score) => {
    if (score >= 90) return { label: '우수', color: '#3281FF' }
    if (score >= 70) return { label: '양호', color: '#22C55E' }
    if (score >= 50) return { label: '보통', color: '#ff8630' }
    if (score >= 30) return { label: '주의', color: '#EAB308' }
    return { label: '부족', color: '#ff4848' }
  }

  return (
    <View style={styles.container}>
      <Header
        title="면접 피드백"
        onBack={
          from === 'Archive'
            ? () => navigation.goBack()
            : null
        }
        showHome={true}
        onHome={() => navigation.navigate('Home')}
        icon={require('../../../assets/icons/home2.png')}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('overall')} style={styles.tabItem}>
          <CustomText
            weight="bold"
            style={[
              styles.tabText,
              activeTab === 'overall' && styles.activeTabText
            ]}
          >
            종합 피드백
          </CustomText>
          {activeTab === 'overall' && <View style={styles.underline} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('each')} style={styles.tabItem}>
          <CustomText
            weight="bold"
            style={[
              styles.tabText,
              activeTab === 'each' && styles.activeTabText
            ]}
          >
            영상별 피드백
          </CustomText>
          {activeTab === 'each' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {activeTab === 'overall' && (
          <View style={styles.contentContainer}>

            {loading ? (
              <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 40 }} />
            ) : (
              <>
                <View style={styles.scoreContainer}>
                  <CustomText weight="bold" style={styles.scoreTitle}>
                    면접 결과
                  </CustomText>

                  <View style={styles.scoreRow}>
                    <CustomText weight="bold" style={styles.AIscore}>
                      {totalScore != null ? `${totalScore}` : '-'}
                    </CustomText>
                    <CustomText weight="bold" style={styles.totalscore}>
                      {' /100점'}
                    </CustomText>
                  </View>

                  <View style={styles.compareBox}>
                    <View style={styles.compareRow}>
                      <CustomText weight="medium" style={styles.compareLabel}>
                        직전 면접 대비
                      </CustomText>
                      <CustomText weight="bold" style={styles.compareValue}>
                        {formatComp(prevScore)}
                      </CustomText>
                    </View>

                    <View style={styles.compareRow}>
                      <CustomText weight="medium" style={styles.compareLabel}>
                        첫 면접 대비
                      </CustomText>
                      <CustomText weight="bold" style={styles.compareValue}>
                        {formatComp(firstScore)}
                      </CustomText>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('Archive')}
                  >
                    <CustomText weight="bold" style={styles.historyText}>
                      이전 면접 비교 보기
                    </CustomText>
                    <Image
                      source={require('../../../assets/icons/arrow2.png')}
                      style={styles.arrowIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ marginHorizontal: -20 }}>
                  <View style={styles.divider} />
                </View>

                <View style={styles.analysisContainer}>
                  <CustomText weight="bold" style={styles.analysisTitle}>
                    분석 결과
                  </CustomText>

                  <AnalysisSection
                    title="답변의 강점"
                    items={analysisData.strengths}
                    showDivider={true}
                  />
                  <AnalysisSection
                    title="아쉬운 점"
                    items={analysisData.weaknesses}
                    showDivider={true}
                  />
                  <AnalysisSection
                    title="개선할 점"
                    items={analysisData.improvements}
                    showDivider={false}
                  />
                </View>

                <View style={{ marginHorizontal: -20 }}>
                  <View style={styles.divider} />
                </View>

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
                        onPress={() =>
                          navigation.navigate('FeedbackDetail', {
                            competency: item,
                            periodFeedbacks: feedbackData?.periodFeedbacks || [],
                          })
                        }
                      >
                        <View style={styles.iconBox}>
                          <Image source={item.icon} style={styles.icon} />
                        </View>

                        <View style={styles.textBox}>
                          <View style={styles.titleRow}>
                            <CustomText weight="bold" style={styles.mainText}>
                              {item.title}
                            </CustomText>
                            <Image
                              source={require('../../../assets/icons/arrow2.png')}
                              style={styles.infoIcon}
                            />
                          </View>
                          <CustomText style={styles.subText}>
                            {item.subtitle}
                          </CustomText>
                        </View>

                        <View style={styles.scoreBox}>
                          <CustomText
                            weight="bold"
                            style={[styles.scoreText, { color: gradeInfo.color }]}
                          >
                            {item.score}%
                          </CustomText>
                          <View
                            style={[
                              styles.gradeBox,
                              { backgroundColor: `${gradeInfo.color}20` }
                            ]}
                          >
                            <CustomText
                              weight="bold"
                              style={[styles.gradeText, { color: gradeInfo.color }]}
                            >
                              {gradeInfo.label}
                            </CustomText>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

          </View>
        )}

        {activeTab === 'each' && (
          <View>
            {loading ? (
              <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 40 }} />
            ) : !feedbackData?.periodFeedbacks?.length ? (
              <CustomText style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
                영상별 피드백 데이터가 없습니다.
              </CustomText>
            ) : (
              feedbackData.periodFeedbacks.map((pf, index) => {
                const pgInfo = getGradeInfo(pf?.overallScore ?? 0)
                return (
                  <View key={index} style={styles.periodFeedbackCard}>
                    <View style={styles.periodFeedbackHeader}>
                      <CustomText weight="bold" style={styles.periodFeedbackNum}>
                        {index + 1}교시
                      </CustomText>
                      <View style={[styles.periodFeedbackGrade, { backgroundColor: `${pgInfo.color}20` }]}>
                        <CustomText weight="bold" style={[styles.periodFeedbackGradeText, { color: pgInfo.color }]}>
                          {pf?.overallScore ?? 0}점
                        </CustomText>
                      </View>
                    </View>
                    <CustomText style={styles.periodFeedbackText}>
                      {pf?.summaryFeedback || '피드백 없음'}
                    </CustomText>
                    {pf?.improvementTips?.length > 0 && (
                      <>
                        <View style={styles.periodFeedbackDivider} />
                        <CustomText weight="bold" style={styles.periodFeedbackTipsTitle}>
                          개선 포인트
                        </CustomText>
                        {pf.improvementTips.map((tip, i) => (
                          <CustomText key={i} style={styles.periodFeedbackTip}>
                            {'• '}{tip}
                          </CustomText>
                        ))}
                      </>
                    )}
                  </View>
                )
              })
            )}
          </View>
        )}
      </ScrollView>

    </View>
  )
}

import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'
import { getSessionFeedback } from '../../api/interview'

// 백엔드 역량 키 → 프론트엔드 역량 매핑
const COMPETENCY_CONFIG = [
  {
    id: 'logic',
    title: '논리 구조력',
    backendKeys: ['logicStructure', 'answerClarity'],
    icon: require('../../../assets/icons/logic.png'),
  },
  {
    id: 'speed',
    title: '속도 조절력',
    backendKeys: ['speechSpeed'],
    icon: require('../../../assets/icons/time.png'),
  },
  {
    id: 'fluency',
    title: '발화 유창성',
    backendKeys: ['fillerWords'],
    icon: require('../../../assets/icons/mouth.png'),
  },
  {
    id: 'nonverbal',
    title: '비언어 표현력',
    backendKeys: ['eyeContact'],
    icon: require('../../../assets/icons/person.png'),
  },
  {
    id: 'persuasion',
    title: '전달 설득력',
    backendKeys: ['voiceVolume'],
    icon: require('../../../assets/icons/mic.png'),
  },
]

const getGradeInfo = (score) => {
  if (score >= 90) return { label: '우수', color: '#3281FF' }
  if (score >= 70) return { label: '양호', color: '#22C55E' }
  if (score >= 50) return { label: '보통', color: '#ff8630' }
  if (score >= 30) return { label: '주의', color: '#EAB308' }
  return { label: '부족', color: '#ff4848' }
}

const avgScores = (keys, scoreMap) => {
  const vals = keys.map(k => scoreMap?.[k] ?? 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

const firstDesc = (keys, descMap) =>
  keys.map(k => descMap?.[k]).filter(Boolean)[0] || ''

const formatDiff = (diff) => (diff >= 0 ? `+${diff}` : `${diff}`)


export default function FeedbackScreen({ navigation, route }) {
  const { from, sessionId, periodQuestions } = route.params ?? {}

  // 모든 훅을 최상단에 선언
  const [activeTab, setActiveTab] = useState('overall')
  const [selectedVideoTab, setSelectedVideoTab] = useState('all')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openQuestionId, setOpenQuestionId] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    getSessionFeedback(sessionId)
      .then(data => setFeedbackData(data))
      .catch(() => Alert.alert('오류', '피드백 데이터를 불러올 수 없어요.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3281FF" />
      </View>
    )
  }

  // 백엔드 데이터 파싱
  const finalFeedback = feedbackData?.finalFeedback
  const periodFeedbacks = feedbackData?.periodFeedbacks || []
  const competencyScores = finalFeedback?.competencyScores || {}
  const competencyShortDescriptions = finalFeedback?.competencyShortDescriptions || {}

  const totalScore = finalFeedback?.totalScore ?? 0
  const prevScore = finalFeedback?.prevSessionScore ?? null
  const firstScore = finalFeedback?.firstSessionScore ?? null

  const competencyData = COMPETENCY_CONFIG.map(cfg => ({
    ...cfg,
    score: avgScores(cfg.backendKeys, competencyScores),
    subtitle: firstDesc(cfg.backendKeys, competencyShortDescriptions),
  }))

  const analysisData = {
    strengths: finalFeedback?.strongPoints || [],
    weaknesses: finalFeedback?.weakPoints || [],
    improvements: finalFeedback?.improvementPoints || [],
  }

  // 동적 탭 (완료된 교시 수 기준)
  const videoTabs = [
    { id: 'all', label: '전체' },
    ...periodFeedbacks.map((_, i) => ({
      id: String(i + 1),
      label: `${i + 1}교시`,
    })),
  ]

  // 교시별 질문 + AI 피드백 요약
  const questionData = periodFeedbacks.map((pf, i) => ({
    id: i + 1,
    tabId: String(i + 1),
    question: periodQuestions?.[i + 1] || `${i + 1}교시 질문`,
    transcript: pf.summaryFeedback || '-',
  }))

  const selectedQuestionData = questionData.find(item => item.tabId === selectedVideoTab)

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

      {/* 점수 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {activeTab === 'overall' && (
          <View style={styles.contentContainer}>
            <View style={styles.scoreContainer}>

              <CustomText weight="bold" style={styles.scoreTitle}>
                면접 결과
              </CustomText>

              <View style={styles.scoreRow}>
                <CustomText weight="bold" style={styles.AIscore}>
                  {totalScore}점
                </CustomText>

                <CustomText weight="bold" style={styles.totalscore}>
                  {' /100점'}
                </CustomText>
              </View>

              {/* 비교 영역 */}
              <View style={styles.compareBox}>
                <View style={styles.compareRow}>
                  <CustomText weight="medium" style={styles.compareLabel}>
                    직전 면접 대비
                  </CustomText>

                  <CustomText weight="bold" style={styles.compareValue}>
                    {prevScore != null
                      ? `${formatDiff(totalScore - prevScore)}점 (${prevScore}점)`
                      : '-'}
                  </CustomText>
                </View>

                <View style={styles.compareRow}>
                  <CustomText weight="medium" style={styles.compareLabel}>
                    첫 면접 대비
                  </CustomText>

                  <CustomText weight="bold" style={styles.compareValue}>
                    {firstScore != null
                      ? `${formatDiff(totalScore - firstScore)}점 (${firstScore}점)`
                      : '-'}
                  </CustomText>
                </View>
              </View>

              {/* 이전 면접 보기 버튼 */}
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('FeedbackComparison', {
                  sessionId,
                  totalScore,
                  currentCompetencyScores: Object.fromEntries(
                    competencyData.map(c => [c.id, c.score])
                  ),
                })}
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

            {/* 구분선 */}
            <View style={{ marginHorizontal: -20 }}>
              <View style={styles.divider} />
            </View>

            {/* 분석 결과 */}
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

            {/* 구분선 */}
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
                        competencyId: item.id,
                        competencyBackendKeys: item.backendKeys,
                        periodFeedbacks,
                      })
                    }
                  >

                    {/* 왼쪽 아이콘 */}
                    <View style={styles.iconBox}>
                      <Image source={item.icon} style={styles.icon} />
                    </View>

                    {/* 가운데 텍스트 */}
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

                    {/* 오른쪽 점수 */}
                    <View style={styles.scoreBox}>
                      <CustomText
                        weight="bold"
                        style={[
                          styles.scoreText,
                          { color: gradeInfo.color }
                        ]}
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
                          style={[
                            styles.gradeText,
                            { color: gradeInfo.color }
                          ]}
                        >
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
      </ScrollView>

      {activeTab === 'each' && (
        <View>
          {/* 상단 가로 탭 */}
          <ScrollView
            style={{ flexGrow: 0 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoTabContainer}
          >
            {videoTabs.map(tab => {
              const isActive = selectedVideoTab === tab.id

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.videoTabButton,
                    isActive && styles.activeVideoTabButton
                  ]}
                  onPress={() => setSelectedVideoTab(tab.id)}
                >
                  <CustomText
                    weight="bold"
                    style={[
                      styles.videoTabText,
                      isActive && styles.activeVideoTabText
                    ]}
                  >
                    {tab.label}
                  </CustomText>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          >

            {/* 탭별 화면 */}
            <View style={styles.videoContentContainer}>

              {/* 영상 영역 */}
              {selectedVideoTab !== 'all' && (
                <View style={styles.videoBox}>
                  <CustomText style={styles.videoPlaceholder}>
                    영상 들어갈 영역
                  </CustomText>
                </View>
              )}


              {selectedVideoTab === 'all' && (
                <View>

                  {/* 질문 리스트 */}
                  <CustomText weight="bold" style={styles.questionTitle}>
                    질문 리스트
                  </CustomText>

                  <View style={styles.questionContainer}>
                    {questionData.map(item => {
                      const isOpen = openQuestionId === item.id

                      return (
                        <View key={item.id}>
                          <TouchableOpacity
                            style={styles.questionItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              setOpenQuestionId(prev =>
                                prev === item.id ? null : item.id
                              )
                            }}
                          >
                            <View style={styles.questionLeft}>
                              <CustomText weight="bold" style={styles.questionNumber}>
                                Q{item.id}
                              </CustomText>

                              <CustomText style={styles.questionText}>
                                {item.question}
                              </CustomText>
                            </View>

                            <Image
                              source={
                                isOpen
                                  ? require('../../../assets/icons/toggle2.png')
                                  : require('../../../assets/icons/toggle1.png')
                              }
                              style={styles.questionArrow}
                            />
                          </TouchableOpacity>

                          {isOpen && (
                            <View style={styles.detailContainer}>

                              <View style={styles.transcriptContainer}>
                                <CustomText weight="bold" style={styles.transcriptTitle}>
                                  내 답변
                                </CustomText>

                                <CustomText style={styles.transcriptText}>
                                  {item.transcript}
                                </CustomText>
                              </View>
                            </View>
                          )}
                        </View>
                      )
                    })}
                  </View>
                </View>
              )}

              {selectedVideoTab !== 'all' && selectedQuestionData && (
                <View style={styles.detailContainer}>

                  {/* 질문 */}
                  <View style={styles.detailQuestionRow}>
                    <CustomText weight="bold" style={styles.detailQuestionNumber}>
                      Q{selectedQuestionData.id}
                    </CustomText>

                    <CustomText style={styles.detailQuestionText}>
                      {selectedQuestionData.question}
                    </CustomText>
                  </View>

                  {/* 답변 전문 */}
                  <View style={styles.transcriptContainer}>
                    <CustomText weight="bold" style={styles.transcriptTitle}>
                      내 답변
                    </CustomText>

                    <CustomText style={styles.transcriptText}>
                      {selectedQuestionData.transcript}
                    </CustomText>
                  </View>

                </View>
              )}

            </View>

          </ScrollView>

        </View>
      )}

    </View>
  )
}

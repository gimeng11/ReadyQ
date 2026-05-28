import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useVideoPlayer, VideoView } from 'expo-video'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'
import { getSessionFeedback } from '../../api/interview'
import { BASE_URL } from '../../api/client'

// 백엔드 역량 세부 키 → 역량 그룹 매핑
const COMPETENCY_KEY_MAP = {
  answerStructure:  { id: 'logic',     name: '논리 구조력' },
  speechSpeed:      { id: 'speed',     name: '속도 조절력' },
  voiceVolume:      { id: 'speed',     name: '속도 조절력' },
  fillerWords:      { id: 'fluency',   name: '발화 유창성' },
  speechBreak:      { id: 'fluency',   name: '발화 유창성' },
  eyeContact:       { id: 'nonverbal', name: '비언어 표현력' },
  facialExpression: { id: 'nonverbal', name: '비언어 표현력' },
  posture:          { id: 'nonverbal', name: '비언어 표현력' },
  voiceTone:        { id: 'persuasion', name: '전달 설득력' },
  intonation:       { id: 'persuasion', name: '전달 설득력' },
  emphasis:         { id: 'persuasion', name: '전달 설득력' },
}

// 백엔드 역량 키 → 프론트엔드 역량 매핑
const COMPETENCY_CONFIG = [
  {
    id: 'logic',
    title: '논리 구조력',
    backendKeys: ['answerStructure'],
    icon: require('../../../assets/icons/logic.png'),
  },
  {
    id: 'speed',
    title: '속도 조절력',
    backendKeys: ['speechSpeed', 'voiceVolume'],
    icon: require('../../../assets/icons/time.png'),
  },
  {
    id: 'fluency',
    title: '발화 유창성',
    backendKeys: ['fillerWords', 'speechBreak'],
    icon: require('../../../assets/icons/mouth.png'),
  },
  {
    id: 'nonverbal',
    title: '비언어 표현력',
    backendKeys: ['eyeContact', 'facialExpression', 'posture'],
    icon: require('../../../assets/icons/person.png'),
  },
  {
    id: 'persuasion',
    title: '전달 설득력',
    backendKeys: ['voiceTone', 'intonation', 'emphasis'],
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

// 교시별 영상 플레이어 컴포넌트
function PeriodVideoPlayer({ sessionId, periodNum, token }) {
  const source = token
    ? {
        uri: `${BASE_URL}/api/interview/${sessionId}/period/${periodNum}/video`,
        headers: { Authorization: `Bearer ${token}` },
      }
    : null

  const player = useVideoPlayer(source, p => {
    p.loop = false
  })

  return (
    <VideoView
      player={player}
      style={styles.videoBox}
      fullscreenOptions={{ fullscreenEnabled: true }}
      allowsPictureInPicture
      contentFit="contain"
    />
  )
}


export default function FeedbackScreen({ navigation, route }) {
  const { from, sessionId, periodQuestions } = route.params ?? {}

  const [activeTab, setActiveTab] = useState('overall')
  const [selectedVideoTab, setSelectedVideoTab] = useState('all')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openQuestionIds, setOpenQuestionIds] = useState(new Set())
  const [authToken, setAuthToken] = useState(null)
  const [eachScrollHeight, setEachScrollHeight] = useState(0)

  useEffect(() => {
    AsyncStorage.getItem('token').then(setAuthToken)
  }, [])

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
  const competencyScores = finalFeedback?.competencyScores || {}
  const competencyShortDescriptions = finalFeedback?.competencyShortDescriptions || {}

  const totalScore = finalFeedback?.totalScore ?? 0
  const prevScore = finalFeedback?.prevSessionScore ?? null
  const firstScore = finalFeedback?.firstSessionScore ?? null

  // periodDetails 우선 사용, 없으면 periodFeedbacks fallback
  const periodDetails = feedbackData?.periodDetails || []
  const periodFeedbacks = periodDetails.length > 0
    ? periodDetails.map(pd => pd.feedback).filter(Boolean)
    : (feedbackData?.periodFeedbacks || [])

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

  // 원포인트 체크 데이터
  const weakestKey = finalFeedback?.weakestCompetency
  const onePointComp = weakestKey ? COMPETENCY_KEY_MAP[weakestKey] : null
  const onePointScore = weakestKey ? (competencyScores[weakestKey] ?? null) : null
  const onePointMessage = finalFeedback?.onePointCoachingMessage || null

  // 동적 탭 (완료된 교시 수 기준)
  const videoTabs = [
    { id: 'all', label: '전체' },
    ...(periodDetails.length > 0
      ? periodDetails.map(pd => ({ id: String(pd.periodNum), label: `${pd.periodNum}교시` }))
      : periodFeedbacks.map((_, i) => ({ id: String(i + 1), label: `${i + 1}교시` }))
    ),
  ]

  // 교시별 질문 + 실제 답변 전사 (periodDetails 우선, 없으면 route params fallback)
  const questionData = periodDetails.length > 0
    ? periodDetails.map(pd => ({
        id: pd.periodNum,
        tabId: String(pd.periodNum),
        question: pd.question || periodQuestions?.[pd.periodNum] || `${pd.periodNum}교시 질문`,
        transcript: pd.transcript || '-',
        hasVideo: pd.hasVideo,
      }))
    : periodFeedbacks.map((_, i) => ({
        id: i + 1,
        tabId: String(i + 1),
        question: periodQuestions?.[i + 1] || `${i + 1}교시 질문`,
        transcript: '-',
        hasVideo: false,
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

      {/* 종합 피드백 탭 */}
      {activeTab === 'overall' && (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
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

            {/* 원포인트 체크 */}
            {onePointComp && onePointScore !== null && (
              <View style={styles.onePointCard}>
                <View style={styles.onePointHeader}>
                  <CustomText weight="bold" style={styles.onePointLabel}>
                    원포인트 체크
                  </CustomText>
                  <CustomText style={{ fontSize: 12, color: '#aaa' }}>
                    최근 면접 기준
                  </CustomText>
                </View>

                <View style={styles.onePointScoreRow}>
                  <CustomText weight="bold" style={styles.onePointCompName}>
                    {onePointComp.name}
                  </CustomText>
                  <View style={styles.onePointScoreRight}>
                    <CustomText
                      weight="bold"
                      style={[styles.onePointScore, { color: getGradeInfo(onePointScore).color }]}
                    >
                      {onePointScore}%
                    </CustomText>
                    <View
                      style={[
                        styles.onePointBadge,
                        { backgroundColor: `${getGradeInfo(onePointScore).color}20` }
                      ]}
                    >
                      <CustomText
                        weight="bold"
                        style={[
                          styles.onePointBadgeText,
                          { color: getGradeInfo(onePointScore).color }
                        ]}
                      >
                        {getGradeInfo(onePointScore).label}
                      </CustomText>
                    </View>
                  </View>
                </View>

                <View style={styles.onePointDivider} />

                <CustomText style={styles.onePointMessage}>
                  {onePointMessage}
                </CustomText>
              </View>
            )}

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
      </ScrollView>
      )}

      {/* 영상별 피드백 탭 */}
      {activeTab === 'each' && (
        <View style={{ flex: 1 }}>
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
            onLayout={e => setEachScrollHeight(e.nativeEvent.layout.height)}
            contentContainerStyle={{ padding: 20, paddingBottom: 150, minHeight: eachScrollHeight }}
          >

            <View style={styles.videoContentContainer}>

              {/* 전체 탭 — 질문 리스트 */}
              {selectedVideoTab === 'all' && (
                <View>
                  <CustomText weight="bold" style={styles.questionTitle}>
                    질문 리스트
                  </CustomText>

                  <View style={styles.questionContainer}>
                    {questionData.map(item => {
                      const isOpen = openQuestionIds.has(item.id)

                      return (
                        <View key={item.id}>
                          <TouchableOpacity
                            style={styles.questionItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              setOpenQuestionIds(prev => {
                                const next = new Set(prev)
                                next.has(item.id) ? next.delete(item.id) : next.add(item.id)
                                return next
                              })
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

              {/* 교시별 탭 — 영상 + 질문 + 답변 */}
              {selectedVideoTab !== 'all' && selectedQuestionData && (
                <View>
                  {/* 영상 플레이어 */}
                  {selectedQuestionData.hasVideo && authToken ? (
                    <PeriodVideoPlayer
                      sessionId={sessionId}
                      periodNum={selectedQuestionData.id}
                      token={authToken}
                    />
                  ) : (
                    <View style={[styles.videoBox, { justifyContent: 'center', alignItems: 'center' }]}>
                      <CustomText style={styles.videoPlaceholder}>
                        {selectedQuestionData.hasVideo
                          ? '영상을 불러오는 중이에요.'
                          : '영상 보관 기간(3일)이 지났어요.'}
                      </CustomText>
                    </View>
                  )}

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
                </View>
              )}

            </View>

          </ScrollView>

        </View>
      )}

    </View>
  )
}

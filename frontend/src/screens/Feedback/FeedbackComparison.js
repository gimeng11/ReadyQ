import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg'
import { useState, useEffect } from 'react'
import { styles } from './FeedbackComparisonStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import { getInterviewHistory, getSessionFeedback } from '../../api/interview'

const labels = ['논리 구조력', '속도 조절력', '발화 유창성', '비언어 표현력', '전달 설득력']

const formatDate = (dateVal) => {
  if (!dateVal) return '-'
  let d
  if (Array.isArray(dateVal)) {
    d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2])
  } else {
    d = new Date(dateVal)
  }
  if (isNaN(d.getTime())) return '-'
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

// 백엔드 역량 점수 → 프론트엔드 5개 항목 매핑
const mapToFrontendScores = (competencyScores) => {
  const cs = competencyScores || {}
  return {
    logic: cs.answerStructure ?? 0,
    speed: Math.round(((cs.speechSpeed ?? 0) + (cs.voiceVolume ?? 0)) / 2),
    fluency: Math.round(((cs.fillerWords ?? 0) + (cs.speechBreak ?? 0)) / 2),
    nonverbal: Math.round(((cs.eyeContact ?? 0) + (cs.facialExpression ?? 0) + (cs.posture ?? 0)) / 3),
    persuasion: Math.round(((cs.voiceTone ?? 0) + (cs.intonation ?? 0) + (cs.emphasis ?? 0)) / 3),
  }
}

export default function FeedbackComparison({ navigation, route }) {
  const { sessionId, totalScore = 0, currentCompetencyScores } = route.params ?? {}

  const [historyList, setHistoryList] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [comparisonData, setComparisonData] = useState(null) // { scores, totalScore }
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingComparison, setLoadingComparison] = useState(false)

  const loadComparisonSession = async (sid) => {
    setLoadingComparison(true)
    try {
      const res = await getSessionFeedback(sid)
      const ff = res.finalFeedback
      setComparisonData({
        scores: mapToFrontendScores(ff?.competencyScores),
        totalScore: ff?.totalScore ?? 0,
      })
    } catch {
      setComparisonData(null)
    }
    setLoadingComparison(false)
  }

  // 이전 면접 기록 로드
  useEffect(() => {
    getInterviewHistory()
      .then(sessions => {
        const completed = sessions
          .filter(s => s.status === 'COMPLETED' && s.id !== sessionId)
          .map(s => ({
            id: s.id,
            date: formatDate(s.completedAt || s.createdAt),
            title: s.title || '-',
          }))
          .reverse()
        setHistoryList(completed)
        if (completed.length > 0) {
          setSelectedSessionId(completed[0].id)
          loadComparisonSession(completed[0].id)
        }
      })
      .catch(e => console.warn('History load error:', e))
      .finally(() => setLoadingHistory(false))
  }, [])

  const currentScores = currentCompetencyScores || {}
  const currentData = [
    currentScores.logic ?? 0,
    currentScores.speed ?? 0,
    currentScores.fluency ?? 0,
    currentScores.nonverbal ?? 0,
    currentScores.persuasion ?? 0,
  ]

  const previousData = comparisonData?.scores
    ? [
        comparisonData.scores.logic,
        comparisonData.scores.speed,
        comparisonData.scores.fluency,
        comparisonData.scores.nonverbal,
        comparisonData.scores.persuasion,
      ]
    : [0, 0, 0, 0, 0]

  const selectedItem = historyList.find(h => h.id === selectedSessionId)
  const comparisonTotalScore = comparisonData?.totalScore ?? 0
  const scoreDiff = totalScore - comparisonTotalScore

  const size = 320
  const radius = 90

  const svgWidth = size + 80
  const svgHeight = size + 60

  const centerX = svgWidth / 2
  const centerY = svgHeight / 2

  const getPoints = (data, scale = 1) => {
    return data.map((value, index) => {
      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2

      const r = (value / 100) * radius * scale

      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      return `${x},${y}`
    }).join(' ')
  }

  return (
    <View style={styles.container}>
      <Header
        title="면접 비교"
        onBack={() => navigation.goBack()}
        showHome={true}
        onHome={() => navigation.navigate('Home')}
      />

      {loadingHistory ? (
        <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 60 }} />
      ) : historyList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <CustomText style={{ color: '#aaa', textAlign: 'center' }}>
            비교할 이전 면접 기록이 없어요.{'\n'}면접을 더 진행하면 비교할 수 있어요.
          </CustomText>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            style={{ flexGrow: 0 }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {historyList.map(item => {
              const isActive = selectedSessionId === item.id

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.tabButton,
                    isActive && styles.activeTabButton,
                  ]}
                  onPress={() => {
                    setSelectedSessionId(item.id)
                    loadComparisonSession(item.id)
                  }}
                >
                  <CustomText
                    weight="bold"
                    style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                    ]}
                  >
                    {item.date}
                  </CustomText>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
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
                    점수 비교
                  </CustomText>

                  <CustomText weight="bold" style={styles.compareValue}>
                    {loadingComparison
                      ? '...'
                      : comparisonData
                        ? `${scoreDiff >= 0 ? '+' : ''}${scoreDiff}점 (${comparisonTotalScore}점)`
                        : '-'}
                  </CustomText>
                </View>

              </View>

            </View>

            <View style={styles.graphContainer}>

              <CustomText weight="bold" style={styles.graphTitle}>
                역량 비교
              </CustomText>

              {/* 레이더 차트 영역 */}
              <View style={styles.radarChartBox}>
                {loadingComparison ? (
                  <ActivityIndicator size="large" color="#3281FF" style={{ marginVertical: 60 }} />
                ) : (
                  <Svg width={svgWidth} height={svgHeight}>

                    {/* 배경 오각형 */}
                    {[1, 0.8, 0.6, 0.4, 0.2].map(scale => (
                      <Polygon
                        key={scale}
                        points={getPoints([100, 100, 100, 100, 100], scale)}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 중심선 */}
                    {labels.map((_, index) => {
                      const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2

                      const x = centerX + radius * Math.cos(angle)
                      const y = centerY + radius * Math.sin(angle)

                      return (
                        <Line
                          key={index}
                          x1={centerX}
                          y1={centerY}
                          x2={x}
                          y2={y}
                          stroke="#E5E7EB"
                          strokeWidth="1"
                        />
                      )
                    })}

                    {/* 축 점수 라벨 */}
                    {[100, 80, 60, 40, 20].map(value => {
                      const angle = -Math.PI / 2

                      const r = (value / 100) * radius

                      const x = centerX + r * Math.cos(angle)
                      const y = centerY + r * Math.sin(angle)

                      return (
                        <SvgText
                          key={value}
                          x={x}
                          y={y - 6}
                          fontSize="10"
                          fill="#94A3B8"
                          textAnchor="middle"
                        >
                          {value}
                        </SvgText>
                      )
                    })}

                    {/* 이전 면접 */}
                    <Polygon
                      points={getPoints(previousData)}
                      fill="rgba(148, 163, 184, 0.25)"
                      stroke="#94A3B8"
                      strokeWidth="1"
                    />

                    {/* 현재 면접 */}
                    <Polygon
                      points={getPoints(currentData)}
                      fill="rgba(50, 129, 255, 0.35)"
                      stroke="#3281FF"
                      strokeWidth="1"
                    />

                    {/* 라벨 */}
                    {labels.map((label, index) => {
                      const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2

                      const labelRadius = radius + 42

                      const x = centerX + labelRadius * Math.cos(angle)
                      const y = centerY + labelRadius * Math.sin(angle)

                      const current = currentData[index]
                      const previous = previousData[index]
                      const diff = current - previous
                      const diffText = diff > 0 ? `+${diff}` : diff

                      return (
                        <View key={label}>
                          {/* 항목명 */}
                          <SvgText
                            x={x}
                            y={y}
                            fontSize="12"
                            fill="#64748B"
                            textAnchor="middle"
                          >
                            {label}
                          </SvgText>

                          {/* 점수 */}
                          <SvgText
                            x={x}
                            y={y + 16}
                            fontSize="11"
                            fill="#3281FF"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {`${current}(${diffText})`}
                          </SvgText>
                        </View>
                      )
                    })}

                  </Svg>
                )}
              </View>

              {/* 범례 */}
              <View style={styles.legendRow}>

                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: '#3281FF' }]}
                  />
                  <CustomText style={styles.legendText}>
                    현재 면접
                  </CustomText>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: '#94A3B8' }]}
                  />
                  <CustomText style={styles.legendText}>
                    {selectedItem?.date || '-'} 면접
                  </CustomText>
                </View>

              </View>

            </View>

          </ScrollView>
        </>
      )}
    </View>
  )
}

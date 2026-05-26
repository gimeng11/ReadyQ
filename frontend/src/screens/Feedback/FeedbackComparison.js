import { View, Image, TextInput, ScrollView, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg'
import { useState } from 'react'
import { styles } from './FeedbackComparisonStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'


export default function FeedbackScreen({ navigation, route}) {
  const [selectedTab, setSelectedTab] = useState('05.01')

  const archiveFeedbacks = [
    { id: 1, date: '05.01' },
    { id: 2, date: '04.18' },
    { id: 3, date: '03.29' },
    { id: 4, date: '03.10' },
  ]

  const currentScores = {
    logic: 90,
    speed: 88,
    fluency: 66,
    nonverbal: 43,
    persuasion: 72,
  }

  const previousScores = {
    logic: 75,
    speed: 70,
    fluency: 60,
    nonverbal: 55,
    persuasion: 68,
  }

  const labels = ['논리 구조력', '속도 조절력', '발화 유창성', '비언어 표현력', '전달 설득력']

  const currentData = [
    currentScores.logic,
    currentScores.speed,
    currentScores.fluency,
    currentScores.nonverbal,
    currentScores.persuasion,
  ]

  const previousData = [
    previousScores.logic,
    previousScores.speed,
    previousScores.fluency,
    previousScores.nonverbal,
    previousScores.persuasion,
  ]



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

      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {archiveFeedbacks.map(item => {
          const isActive = selectedTab === item.date

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tabButton,
                isActive && styles.activeTabButton,
              ]}
              onPress={() => setSelectedTab(item.date)}
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
              80.22점
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
                +5.08점 (75.14점)
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
                const angle = -Math.PI / 2 // 맨 위 축 기준 (논리 구조력 방향)

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
                {selectedTab} 면접
              </CustomText>
            </View>

          </View>

        </View>

      </ScrollView>

    </View>

    
  )
}
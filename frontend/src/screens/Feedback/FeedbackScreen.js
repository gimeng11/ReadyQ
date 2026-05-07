import { View, Image, TextInput, ScrollView, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'


export default function FeedbackScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overall') // 'overall' | 'each'

  //분석 결과 데이터(임시), 추후 AI API 연결 필요
  const analysisData = {
    strengths: 
    [
      '질문이 무엇을 묻고 있는지 잘 이해하고,핵심에 맞는 답변을 했어요.', 
      '경험을 실제 사례 중심으로 설명해, 답변이 생생하게 전달됐어요.',
    ], 
    weaknesses: 
    [
      '답변이 길어지면서 핵심 메시지가 다소 흐려진 부분이 있었어요.',
      '결과보다는 과정 중심의 설명이 많아, 성과가 충분히 드러나지 않았어요.',
    ],
    improvements: 
    [
      '답변의 결론을 먼저 말한 뒤, 경험을 간단히 덧붙여 보세요.',
      '상황-행동-결과 순서로 정리하면 답변이 더 명확해질 거예요.',
    ],
  }

  /*총 면접 역량 데이터, score 추후 AI API 연결 필요.
  ---------------------
  <<socre에 따른 grade>>
  100~90 우수 (파랑)
  89~70 양호 (초록)
  69~50 보통 (주황)
  49~30 주의 (노랑)
  30~0 부족 (빨강)
  ---------------------
  */
  const competencyData = [
    {
      title: '논리 구조력',
      subtitle: '답변 구조',
      score: 90,
      icon: require('../../../assets/icons/logic.png'),
    },
    {
      title: '속도 조절력',
      subtitle: '말하기 속도 · 음성 크기',
      score: 88,
      icon: require('../../../assets/icons/time.png'),
    },
    {
      title: '발화 유창성',
      subtitle: '추임새 빈도 · 말 끊김',
      score: 66,
      icon: require('../../../assets/icons/mouth.png'),
    },
    {
      title: '비언어 표현력',
      subtitle: '시선 처리 · 표정 · 자세',
      score: 43,
      icon: require('../../../assets/icons/person.png'),
    },
    {
      title: '전달 설득력',
      subtitle: '목소리 톤 · 역양 · 강조',
      score: 0,
      icon: require('../../../assets/icons/mic.png'),
    },
  ]

  const getGradeInfo = (score) => {
    if (score >= 90) {
      return { label: '우수', color: '#3281FF' } // 파랑
    } else if (score >= 70) {
      return { label: '양호', color: '#22C55E' } // 초록
    } else if (score >= 50) {
      return { label: '보통', color: '#ff8630' } // 주황
    } else if (score >= 30) {
      return { label: '주의', color: '#EAB308' } // 노랑
    } else {
      return { label: '부족', color: '#ff4848' } // 빨강
    }
  }


  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.navigate ('Home')}
        icon={require('../../../assets/icons/home2.png')}
        title=' 면접 피드백'
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
                  80.22점
                  {/* 임의 점수. 추후 AI 점수로 로직 수정 필요 */}
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
                    {/*  이전 면접 데이터 비교 로직 (이전 면접 데이터 없을 경우 '-' 출력) */}
                  </CustomText>

                  <CustomText weight="bold" style={styles.compareValue}>
                    +5.08점 (75.14점)
                  </CustomText>
                </View>

                <View style={styles.compareRow}>
                  <CustomText weight="medium" style={styles.compareLabel}>
                    첫 면접 대비
                    {/*  첫 면접 데이터 비교 로직 (이게 필요할까?) */}
                  </CustomText>

                  <CustomText weight="bold" style={styles.compareValue}>
                    +14.01점 (66.21점)
                  </CustomText>
                </View>
              </View>

              {/* 이전 면접 보기 버튼*/}
              <TouchableOpacity style={styles.historyButton}>
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
                        competency: item,
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

        {activeTab === 'each' && (
          <View>
            <CustomText>영상별 피드백 내용</CustomText>
          </View>
        )}
      </ScrollView>
        
    </View>

    
  )
}
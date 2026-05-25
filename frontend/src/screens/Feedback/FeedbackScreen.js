import { View, Image, TextInput, ScrollView, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react'
import { styles } from './FeedbackStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'


export default function FeedbackScreen({ navigation, route}) {
  const { from } = route.params ?? {}

  const [activeTab, setActiveTab] = useState('overall') // 'overall' | 'each'

  const [selectedVideoTab, setSelectedVideoTab] = useState('all') 
  // 'all' | '1' | '2' | '3' | '4' | '5' 

  // 사용자가 중간에 면접을 종료하면 진행된 교시까지만 피드백이 제공될 예정이므로
  // 백 연결 후 동적으로 리펙토링 예정임.
  const videoTabs = [
    { id: 'all', label: '전체 영상' },
    { id: '1', label: '1교시' },
    { id: '2', label: '2교시' },
    { id: '3', label: '3교시' },
    { id: '4', label: '4교시' },
    { id: '5', label: '5교시' },
  ]

  //영상별 비디오 리스트 (ex: all: ~~~ , 1: ~~~, ...)
  const videoData = {
    
  }

  const currentVideo = videoData[selectedVideoTab]

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
      id: 'logic',
      title: '논리 구조력',
      subtitle: '근거가 부족해요.',
      score: 90,
      icon: require('../../../assets/icons/logic.png'),
    },
    {
      id: 'speed',
      title: '속도 조절력',
      subtitle: '말이 빨라요.',
      score: 88,
      icon: require('../../../assets/icons/time.png'),
    },
    {
      id: 'fluency',
      title: '발화 유창성',
      subtitle: '추임새가 잦아요.',
      score: 66,
      icon: require('../../../assets/icons/mouth.png'),
    },
    {
      id: 'nonverbal',
      title: '비언어 표현력',
      subtitle: '표정이 어색해요.',
      score: 43,
      icon: require('../../../assets/icons/person.png'),
    },
    {
      id: 'persuasion',
      title: '전달 설득력',
      subtitle: '목소리 톤이 너무 일정해요.',
      score: 0,
      icon: require('../../../assets/icons/mic.png'),
    },
  ]

  // 전체 영상 질문 리스트 (임시 데이터)
  const questionData = [
    {
      id: 1,
      tabId: '1',
      question: '지원한 직무에 관심을 가지게 된 계기는 무엇인가요?',
      transcript: '안녕하세요, 사용자 중심의 경험을 설계하는 UX/UI 디자이너 레디큐입니다. 데이터와 사용자 행동을 기반으로 문제를 정의하고, 직관적이고 효율적인 인터페이스를 만드는 데 집중하고 있습니다.',
    },
    {
      id: 2,
      tabId: '2',
      question: '프로젝트에서 어려웠던 경험을 설명해주세요.',
      transcript: '프로젝트 진행 당시 ...',
    },
    {
      id: 3,
      tabId: '3',
      question: '협업 과정에서 갈등을 해결한 경험이 있나요?',
      transcript: '팀 프로젝트를 진행하며 ...',
    },
    {
      id: 4,
      tabId: '4',
      question: '본인의 강점은 무엇이라고 생각하나요?',
      transcript: '저의 가장 큰 강점은 ...',
    },
    {
      id: 5,
      tabId: '5',
      question: '입사 후 이루고 싶은 목표가 있나요?',
      transcript: '입사 후에는 ...',
    },
  ]

  const selectedQuestionData = questionData.find(
    item => item.tabId === selectedVideoTab
  )

  const [selectedQuestion, setSelectedQuestion] = useState(null)

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
              <TouchableOpacity 
                style={styles.historyButton}
                onPress={() => navigation.navigate('FeedbackComparison')}
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

            {/* 상단 가로 탭 */}
            <ScrollView
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

            {/* 탭별 화면 */}
            <View style={styles.videoContentContainer}>
              
              {/* 영상 영역 */}
              <View style={styles.videoBox}>
                <CustomText style={styles.videoPlaceholder}> 
                  영상 들어갈 영역   {/* 영상 실제로 들어갈 때는  videoPlaceholder 삭제 예정 */}
                </CustomText>

                {/* 영상 실제로 들어갈 때 videoPlaceholder 삭제하고 사용 */}
                {/* <Video
                  source={{ uri: currentVideo }}
                  style={styles.video}
                  useNativeControls
                  resizeMode="cover"
                /> */}
              </View>


              {selectedVideoTab === 'all' && (
                <View>

                  {/* 질문 리스트 */}
                  <CustomText weight="bold" style={styles.questionTitle}>
                    질문 리스트
                  </CustomText>

                  <View style={styles.questionContainer}>
                    {questionData.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.questionItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedQuestion(item)
                          setSelectedVideoTab(item.tabId)
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
                          source={require('../../../assets/icons/arrow2.png')}
                          style={styles.questionArrow}
                        />
                      </TouchableOpacity>
                    ))}
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

          </View>
        )}
      </ScrollView>
        
    </View>

    
  )
}
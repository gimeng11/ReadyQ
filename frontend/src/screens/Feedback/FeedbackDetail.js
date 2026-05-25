import { View, ScrollView } from 'react-native'
import { styles } from './FeedbackDetailStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'

export default function FeedbackDetail({ navigation, route }) {

  const { competencyId } = route.params

  const competencyMap = {
    logic: '논리 구조력',
    speed: '속도 조절력',
    fluency: '발화 유창성',
    nonverbal: '비언어 표현력',
    persuasion: '전달 설득력',
  }

  const title = competencyMap[competencyId] ?? '데이터 없음'

  // 세부 데이터
  const competencyDetailData = {
    logic: [
      {
        title: '답변 구조',
        score: 90,
        weakness: '답변의 결론이 다소 늦게 나왔어요.',
        improvement: '핵심 결론을 먼저 전달해보세요.',
      },
    ],

    speed: [
      {
        title: '말하기 속도',
        score: 88,
        weakness: '전체적으로 말이 빨랐어요.',
        improvement: '문장 사이에 짧은 호흡을 넣어보세요.',
      },
      {
        title: '음성 크기',
        score: 88,
        weakness: '전체적으로 말이 빨랐어요.',
        improvement: '문장 사이에 짧은 호흡을 넣어보세요.',
      },
    ],

    fluency: [
      {
        title: '추임새 빈도',
        score: 66,
        weakness: '추임새 사용이 잦았어요.',
        improvement: '짧게 생각 후 답변하는 연습을 해보세요.',
      },
      {
        title: '말 끊김',
        score: 66,
        weakness: '추임새 사용이 잦았어요.',
        improvement: '짧게 생각 후 답변하는 연습을 해보세요.',
      },
    ],

    nonverbal: [
      {
        title: '시선처리',
        score: 43,
        weakness: '표정 변화가 다소 어색했어요.',
        improvement: '자연스럽게 미소를 유지해보세요.',
      },
      {
        title: '표정',
        score: 43,
        weakness: '표정 변화가 다소 어색했어요.',
        improvement: '자연스럽게 미소를 유지해보세요.',
      },
      {
        title: '자세',
        score: 43,
        weakness: '표정 변화가 다소 어색했어요.',
        improvement: '자연스럽게 미소를 유지해보세요.',
      },
    ],

    persuasion: [
      {
        title: '목소리 톤',
        score: 0,
        weakness: '톤 변화가 적었어요.',
        improvement: '강조할 부분에서 억양 변화를 줘보세요.',
      },
      {
        title: '억양',
        score: 0,
        weakness: '톤 변화가 적었어요.',
        improvement: '강조할 부분에서 억양 변화를 줘보세요.',
      },
      {
        title: '강조',
        score: 0,
        weakness: '톤 변화가 적었어요.',
        improvement: '강조할 부분에서 억양 변화를 줘보세요.',
      },
    ],
  }

  // 현재 선택된 역량 데이터
  const detailItems = competencyDetailData[competencyId] ?? []

  // 등급
  const getGradeInfo = (score) => {
    if (score >= 90) {
      return { label: '우수', color: '#3281FF' }
    } else if (score >= 70) {
      return { label: '양호', color: '#22C55E' }
    } else if (score >= 50) {
      return { label: '보통', color: '#ff8630' }
    } else if (score >= 30) {
      return { label: '주의', color: '#EAB308' }
    } else {
      return { label: '부족', color: '#ff4848' }
    }
  }

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

        {detailItems.map((item, index) => {

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
        })}

      </ScrollView>
    </View>
  )
}
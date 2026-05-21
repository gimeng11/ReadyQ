import { View } from 'react-native';
import { styles } from './QuestionTypeStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function QuestionType({ navigation, route }) {
  const { interviewerType, title } = route.params || {}

    return (
      <View style={styles.container}>
        <Header
          onBack={() => navigation.goBack()}
        />

        <View style={styles.topSection}>
          <CustomText weight="bold" style={styles.label1}>
            AI 면접을 시작하기 전,
          </CustomText>
          <CustomText weight="bold" style={styles.label2}>
            질문 유형을 선택해주세요.
          </CustomText>
          <CustomText weight="semibold" style={styles.label3}>
            '질문 직접 선택'은 2교시부터 질문 후보 5개 중 선택할 수 있고,{"\n"}
            '랜덤 질문'은 자동으로 한개의 질문이 선택되어 면접이 진행돼요.
          </CustomText>
        </View>

        <View style={styles.buttonSection}>
          <CustomButton
            title='질문 직접 선택'
            type='secondary'
            style={styles.Button}
            onPress={() => {
              navigation.navigate('InterviewCamera', {
                selectedType: 'select',
                interviewerType,
                title,
              })
            }}
          />

          <CustomButton
            title='랜덤 질문'
            type='secondary'
            style={styles.Button}
            onPress={() => {
              navigation.navigate('InterviewCamera', {
                selectedType: 'random',
                interviewerType,
                title,
              })
            }}
          />
        </View>

      </View>
    )
  }

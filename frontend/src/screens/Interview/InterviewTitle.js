import { View, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react'
import { styles } from './InterviewTitleStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function InterviewTitle({ navigation, route }) {
  const { selectedType: interviewerType } = route.params || {}
  const [title, setTitle] = useState('')

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Header
            onBack={() => navigation.goBack()}
          />

          <View style={styles.topSection}>
            <CustomText weight="bold" style={styles.label1}>
              AI 면접을 시작하기 전,
            </CustomText>
            <CustomText weight="bold" style={styles.label2}>
              면접 제목을 입력해주세요
            </CustomText>
            <CustomText weight="semibold" style={styles.label3}>
              나중에 아카이브에서 쉽게 확인할 수 있어요.
            </CustomText>
          </View>


          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="면접 제목을 입력해주세요"
              placeholderTextColor="#aaa"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <CustomButton
            title='다음'
            type={title ? 'primary' : 'secondary'}
            disabled={!title}
            style={styles.Button}
            onPress={() => {
              if (!title) return
              navigation.navigate('QuestionType', {
                interviewerType,
                title,
              })
            }}
          />

        </View>
      </TouchableWithoutFeedback>
    )
  }

import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert, StyleSheet } from 'react-native'
import { useState } from 'react'
import { styles } from './InterviewTitleStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { startInterview } from '../../api/interview'

const INTERVIEWER_TYPE_MAP = {
  basic: 'DEFAULT',
  kind: 'FRIENDLY',
  strict: 'PRESSURE',
  logic: 'LOGIC',
}

export default function InterviewTitle({ navigation, route }) {
  const { selectedType } = route.params  // InterviewScreen에서 전달된 면접관 유형

  const [targetCompany, setTargetCompany] = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)

  const isReady = targetCompany.trim() && targetJob.trim()

  const handleStart = async () => {
    if (!isReady) return
    setLoading(true)
    try {
      const res = await startInterview({
        interviewerType: INTERVIEWER_TYPE_MAP[selectedType] ?? 'DEFAULT',
        coverLetter: coverLetter.trim(),
        targetCompany: targetCompany.trim(),
        targetJob: targetJob.trim(),
      })

      navigation.navigate('InterviewCamera', {
        sessionId: res.sessionId,
        question: res.question,
        periodNum: res.periodNum,
        interviewerType: res.interviewerType,
      })
    } catch (e) {
      Alert.alert('오류', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header onBack={() => navigation.goBack()} />

        <View style={styles.topSection}>
          <CustomText weight="bold" style={styles.label1}>
            AI 면접을 시작하기 전,
          </CustomText>
          <CustomText weight="bold" style={styles.label2}>
            면접 정보를 입력해주세요
          </CustomText>
          <CustomText weight="semibold" style={styles.label3}>
            입력한 정보를 바탕으로 AI가 면접 질문을 생성합니다.
          </CustomText>
        </View>

        <ScrollView style={styles.inputSection} keyboardShouldPersistTaps="handled">
          <CustomText weight="semibold" style={localStyles.fieldLabel}>목표 기업</CustomText>
          <TextInput
            style={styles.input}
            placeholder="예: 삼성전자, 카카오"
            placeholderTextColor="#aaa"
            value={targetCompany}
            onChangeText={setTargetCompany}
          />

          <CustomText weight="semibold" style={[localStyles.fieldLabel, { marginTop: 16 }]}>목표 직무</CustomText>
          <TextInput
            style={styles.input}
            placeholder="예: 백엔드 개발자, 프론트엔드 개발자"
            placeholderTextColor="#aaa"
            value={targetJob}
            onChangeText={setTargetJob}
          />

          <CustomText weight="semibold" style={[localStyles.fieldLabel, { marginTop: 16 }]}>자기소개서</CustomText>
          <TextInput
            style={[styles.input, localStyles.coverLetterInput]}
            placeholder="자기소개서 내용을 입력해주세요"
            placeholderTextColor="#aaa"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <CustomButton
          title={loading ? '면접 준비 중...' : '면접 시작하기'}
          type={isReady && !loading ? 'primary' : 'secondary'}
          disabled={!isReady || loading}
          style={styles.Button}
          onPress={handleStart}
        />
      </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const localStyles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  coverLetterInput: {
    height: 160,
    paddingTop: 14,
  },
})

import { View, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { styles } from './SignUpStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { sendSms, verifySms } from '../../api/auth'

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({
    nickname: '',
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    phone: '',
  })
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [smsVerified, setSmsVerified] = useState(false)

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }))

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    if (digits.length < 4) return digits
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const handleSendSms = async () => {
    console.log('[SMS] 인증 버튼 눌림, phone:', form.phone)
    if (!form.phone) {
      Alert.alert('알림', '전화번호를 입력해주세요')
      return
    }
    try {
      await sendSms(form.phone)
      Alert.alert('알림', '인증코드가 발송되었습니다\n서버 콘솔에서 코드를 확인하세요 (개발 중)')
    } catch (e) {
      Alert.alert('오류', e.message)
    }
  }

  const handleSignUp = async () => {
    const { nickname, email, username, password, passwordConfirm, phone } = form
    if (!nickname || !email || !username || !password || !passwordConfirm || !phone || !code) {
      Alert.alert('알림', '모든 항목을 입력해주세요')
      return
    }
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다')
      return
    }
    setLoading(true)
    try {
      if (!smsVerified) {
        const smsResult = await verifySms(phone, code)
        if (!smsResult.verified) {
          Alert.alert('오류', '인증코드가 올바르지 않습니다')
          return
        }
        setSmsVerified(true)
      }
      navigation.navigate('SignUpJob', { formData: { nickname, email, username, password, phone } })
    } catch (e) {
      Alert.alert('오류', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <Header title="개인 회원가입" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>

          <CustomText weight="medium" style={styles.label}>닉네임</CustomText>
          <TextInput
            placeholder="닉네임을 설정하세요"
            style={styles.input}
            value={form.nickname}
            onChangeText={set('nickname')}
          />

          <CustomText weight="medium" style={styles.label}>이메일</CustomText>
          <TextInput
            placeholder="이메일을 입력하세요"
            style={styles.input}
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomText weight="medium" style={styles.label}>아이디</CustomText>
          <TextInput
            placeholder="아이디를 입력하세요"
            style={styles.input}
            value={form.username}
            onChangeText={set('username')}
            autoCapitalize="none"
          />

          <CustomText weight="medium" style={styles.label}>비밀번호</CustomText>
          <TextInput
            placeholder="비밀번호를 입력하세요"
            secureTextEntry
            style={styles.input}
            value={form.password}
            onChangeText={set('password')}
          />

          <CustomText weight="medium" style={styles.label}>비밀번호 재확인</CustomText>
          <TextInput
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            style={styles.input}
            value={form.passwordConfirm}
            onChangeText={set('passwordConfirm')}
          />

          <CustomText weight="medium" style={styles.label}>전화번호</CustomText>
          <View style={styles.phoneRow}>
            <TextInput
              placeholder="010-0000-0000"
              style={styles.phoneInput}
              value={form.phone}
              onChangeText={(val) => { set('phone')(formatPhone(val)); setSmsVerified(false) }}
              keyboardType="number-pad"
              maxLength={13}
            />
            <CustomButton title="인증" type="secondary" style={styles.verifyButton} onPress={handleSendSms} />
          </View>

          <CustomText weight="medium" style={styles.label}>인증번호</CustomText>
          <TextInput
            placeholder="인증번호 6자리를 입력하세요"
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <CustomButton
            title={loading ? '처리 중...' : '회원가입'}
            type="secondary"
            style={styles.button}
            onPress={handleSignUp}
          />

        </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  )
}

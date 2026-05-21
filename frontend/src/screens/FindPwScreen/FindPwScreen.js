import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { styles } from './FindPwStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { sendEmail, verifyForPasswordReset } from '../../api/auth'

export default function FindPwScreen({ navigation }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요')
      return
    }
    try {
      await sendEmail(email)
      Alert.alert('알림', '인증코드가 발송되었습니다\n서버 콘솔에서 코드를 확인하세요 (개발 중)')
    } catch (e) {
      Alert.alert('오류', e.message)
    }
  }

  const handleVerify = async () => {
    if (!username || !email || !code) {
      Alert.alert('알림', '모든 항목을 입력해주세요')
      return
    }
    setLoading(true)
    try {
      const data = await verifyForPasswordReset(username, email, code)
      navigation.navigate('NewPw', { resetToken: data.resetToken })
    } catch (e) {
      Alert.alert('오류', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <Header title="비밀번호 찾기" onBack={() => navigation.goBack()} />
      <View style={styles.topSection}>

        <CustomText style={styles.label}>아이디</CustomText>
        <TextInput
          placeholder="아이디를 입력하세요"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <CustomText style={styles.label}>이메일</CustomText>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="readyQ@ready.com"
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CustomButton
            title="인증"
            type="primary"
            style={styles.verifyButtonSmall}
            onPress={handleSendEmail}
          />
        </View>

        <CustomText style={styles.label}>인증번호</CustomText>
        <TextInput
          placeholder="인증번호 6자리를 입력하세요"
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <CustomButton
          title={loading ? '확인 중...' : '비밀번호 재설정'}
          type="secondary"
          onPress={handleVerify}
        />

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
            <CustomText style={styles.linkText}>아이디 찾기</CustomText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <CustomText style={styles.linkText}>로그인</CustomText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <CustomText style={styles.linkText}>회원가입</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}

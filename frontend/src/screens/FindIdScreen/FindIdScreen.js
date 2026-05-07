import { View, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { styles } from './FindIdStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { sendEmail, findUsername } from '../../api/auth'

export default function FindIdScreen({ navigation }) {
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

  const handleFindUsername = async () => {
    if (!email || !code) {
      Alert.alert('알림', '이메일과 인증코드를 입력해주세요')
      return
    }
    setLoading(true)
    try {
      const data = await findUsername(email, code)
      Alert.alert('아이디 찾기', `회원님의 아이디는\n"${data.username}" 입니다`, [
        { text: '로그인하기', onPress: () => navigation.navigate('Login') },
      ])
    } catch (e) {
      Alert.alert('오류', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Header title="아이디 찾기" onBack={() => navigation.goBack()} />
      <View style={styles.topSection}>

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
          title={loading ? '찾는 중...' : '아이디 찾기'}
          type="secondary"
          onPress={handleFindUsername}
        />

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => navigation.navigate('FindPw')}>
            <CustomText style={styles.linkText}>비밀번호 찾기</CustomText>
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
  )
}

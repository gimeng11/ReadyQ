import { View, TextInput, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { styles } from './LoginStyles'
import CustomButton from '../../components/CustomButton'
import CustomText from '../../components/CustomText'
import { login } from '../../api/auth'
import { saveToken } from '../../utils/storage'
import { BASE_URL } from '../../api/client'
import { useUser } from '../../context/UserContext'

export default function LoginScreen({ navigation }) {
  const { fetchUserInfo } = useUser();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSnsLogin = async (provider) => {
    setLoading(true)
    try {
      const appRedirect = Linking.createURL('/oauth2/redirect')
      const oauthUrl = `${BASE_URL}/oauth2/authorization/${provider}?app_redirect=${encodeURIComponent(appRedirect)}`
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, appRedirect)

      if (result.type === 'success') {
        const parsed = Linking.parse(result.url)
        const token = parsed.queryParams?.token
        if (token) {
          await saveToken(token)
          await fetchUserInfo()
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
        } else {
          Alert.alert('로그인 실패', 'SNS 로그인 중 오류가 발생했습니다')
        }
      }else{
        console.log('로그인 세션이 성공적으로 완료되지 않음:', result.type);
      }
    } catch (e) {
      Alert.alert('로그인 실패', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요')
      return
    }
    setLoading(true)
    try {
      const data = await login(username, password)
      await saveToken(data.token)
      await fetchUserInfo()
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch (e) {
      Alert.alert('로그인 실패', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.container}>
      <View style={styles.topSection}>
        <CustomText weight="bold" style={styles.title}>
          로그인
        </CustomText>

        <TextInput
          placeholder="아이디를 입력하세요"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />


        <CustomButton
          title={loading ? '로그인 중...' : '로그인'}
          type="secondary"
          onPress={handleLogin}
        />

        <CustomButton title="로그인" type="secondary" onPress={() => navigation.navigate('Onboarding')} />
         frontend_interview

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
            <CustomText style={styles.linkText}>아이디 찾기</CustomText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => navigation.navigate('FindPw')}>
            <CustomText style={styles.linkText}>비밀번호 찾기</CustomText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <CustomText style={styles.linkText}>회원가입</CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <CustomText style={styles.orText}>
            SNS 계정으로 로그인하기
          </CustomText>
          <View style={styles.line} />
        </View>

        <View style={styles.snsRow}>
          <TouchableOpacity style={styles.snsButton} onPress={() => handleSnsLogin('kakao')}>
            <Image
              source={require('../../../assets/icons/kakao.png')}
              style={styles.snsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.snsButton} onPress={() => handleSnsLogin('naver')}>
            <Image
              source={require('../../../assets/icons/naver.png')}
              style={styles.snsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.snsButton} onPress={() => handleSnsLogin('google')}>
            <Image
              source={require('../../../assets/icons/google.png')}
              style={styles.snsIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <CustomText style={styles.companyText}>기업 회원이신가요?</CustomText>
        <TouchableOpacity>
          <CustomText weight="medium" style={styles.companyLink}>
            기업 회원으로 회원가입하기
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}

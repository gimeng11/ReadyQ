import { View, TextInput,Image, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { styles } from './LoginStyles'
import CustomButton from '../../components/CustomButton'
import CustomText from '../../components/CustomText'
import { login } from '../../api/auth'
import { saveToken } from '../../utils/storage'

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요')
      return
    }
    setLoading(true)
    try {
      const data = await login(username, password)
      await saveToken(data.token)
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch (e) {
      Alert.alert('로그인 실패', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
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
          <TouchableOpacity style={styles.snsButton}>
            <Image
              source={require('../../../assets/icons/kakao.png')}
              style={styles.snsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.snsButton}>
            <Image
              source={require('../../../assets/icons/naver.png')}
              style={styles.snsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.snsButton}>
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
  )
}

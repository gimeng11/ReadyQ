import { View, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { styles } from './NewPwStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { resetPassword } from '../../api/auth'

export default function NewPwScreen({ navigation, route }) {
  const { resetToken } = route.params

  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleReset = async () => {
    if (!newPassword || !passwordConfirm) {
      Alert.alert('알림', '비밀번호를 입력해주세요')
      return
    }
    if (newPassword !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다')
      return
    }
    if (newPassword.length < 8) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다')
      return
    }

    setLoading(true)
    try {
      await resetPassword(resetToken, newPassword)
      setIsDone(true)
    } catch (e) {
      Alert.alert('오류', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Header title="비밀번호 재설정" onBack={() => navigation.goBack()} />

      {isDone ? (
        <>
          <View style={styles.centerSection}>
            <CustomText weight="bold" style={styles.successText}>
              OO님의 비밀번호가{'\n'}정상적으로 변경되었습니다
            </CustomText>
          </View>

          <View style={styles.bottomFixed}>
            <CustomButton
              title="로그인 화면으로 돌아가기"
              type="primary"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </>
      ) : (
        <View style={styles.topSection}>
          <CustomText weight="bold" style={styles.title}>
            비밀번호 재설정
          </CustomText>

          <CustomText style={styles.label}>새 비밀번호</CustomText>
          <TextInput
            placeholder="새 비밀번호를 입력하세요"
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <CustomText style={styles.label}>새 비밀번호 재확인</CustomText>
          <TextInput
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            style={styles.input}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />

          <CustomButton
            title={loading ? '변경 중...' : '변경하기'}
            type="secondary"
            onPress={handleReset}
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
      )}
    </View>
  )
}
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { styles } from './NewPwStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function NewPwScreen({ navigation }) {
  const [pw, setPw] = useState('')
  const [pwCheck, setPwCheck] = useState('')
  const [isDone, setIsDone] = useState(false)

  const handleChangePw = () => {
    if (pw && pw === pwCheck) {
      setIsDone(true)
    } else {
      alert('비밀번호가 일치하지 않습니다.')
    }
  }

  return (
    <View style={styles.container}>
      <Header onBack={() => navigation.goBack()} />

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

          <CustomText style={styles.label}>
            새 비밀번호
          </CustomText>
          <TextInput
            placeholder="새 비밀번호를 입력하세요"
            secureTextEntry
            style={styles.input}
            value={pw}
            onChangeText={setPw}
          />

          <CustomText style={styles.label}>
            새 비밀번호 재확인
          </CustomText>
          <TextInput
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            style={styles.input}
            value={pwCheck}
            onChangeText={setPwCheck}
          />

          <CustomButton
            title="변경하기"
            type="secondary"
            onPress={handleChangePw}
          />

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
              <CustomText style={styles.linkText}>
                아이디 찾기
              </CustomText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <CustomText style={styles.linkText}>
                로그인
              </CustomText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <CustomText style={styles.linkText}>
                회원가입
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}
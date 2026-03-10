import { View, TextInput, TouchableOpacity } from 'react-native'
import { styles } from './LoginStyles'
import CustomButton from '../../components/CustomButton'
import CustomText from '../../components/CustomText'

export default function LoginScreen({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <CustomText weight="bold" style={styles.title}>
          로그인
        </CustomText>

        <TextInput
          placeholder="아이디를 입력하세요"
          style={styles.input}
        />

        <TextInput
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          style={styles.input}
        />

        <CustomButton title="로그인" type="secondary" />

        <View style={styles.linkRow}>
          <TouchableOpacity>
            <CustomText style={styles.linkText}>
              아이디 찾기
            </CustomText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity>
            <CustomText style={styles.linkText}>
              비밀번호 찾기
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

      <View style={styles.bottomSection}>
        <CustomText style={styles.companyText}>
          기업 회원이신가요?
        </CustomText>

        <TouchableOpacity>
          <CustomText weight="medium" style={styles.companyLink}>
            기업 회원으로 회원가입하기
          </CustomText>
        </TouchableOpacity>
      </View>

    </View>
  )
}
import { View, TextInput, TouchableOpacity,ScrollView, Image } from 'react-native'
import { styles } from './SignUpStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function SignUpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header
            title="개인 회원가입"
            onBack={() => navigation.goBack()}
        />
        <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        >
      <View style={styles.inner}>


        <CustomText weight="medium" style={styles.label}>
          닉네임
        </CustomText>
        <TextInput placeholder="닉네임을 설정하세요" style={styles.input} />
        <CustomText weight="medium" style={styles.label}>
          이메일
        </CustomText>
        <TextInput placeholder="이메일을 입력하세요" style={styles.input} />
        <CustomText style={styles.label}>
          아이디
        </CustomText>
        <TextInput placeholder="아이디를 입력하세요" style={styles.input} />
        <CustomText weight="medium" style={styles.label}>
          비밀번호
        </CustomText>
        <TextInput placeholder="비밀번호를 입력하세요" secureTextEntry style={styles.input} />
        <CustomText style={styles.label}>
          비밀번호 재확인
        </CustomText>
        <TextInput placeholder="비밀번호를 다시 입력하세요" secureTextEntry style={styles.input} />
        <CustomText weight="medium" style={styles.label}>
          전화번호
        </CustomText>
        <View style={styles.phoneRow}>
          <TextInput placeholder="010-0000-0000" style={styles.phoneInput} />
          <CustomButton title="인증" type="secondary" style={styles.verifyButton} />
        </View>

        <CustomText weight="medium" style={styles.label}>
          인증번호
        </CustomText>
        <TextInput placeholder="인증번호 6자리를 입력하세요" style={styles.input} />

        <CustomButton title="회원가입" type="secondary" style={styles.button}/>

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
    </ScrollView>


    </View>
  )
}
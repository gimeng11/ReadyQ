import { View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './FindPwStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function FindPwScreen({ navigation }) {
    return (
      
      <View style={styles.container}>
         <Header
                    onBack={() => navigation.goBack()}
                />
        <View style={styles.topSection}>
          <CustomText weight="bold" style={styles.title}>
            비밀번호 찾기
          </CustomText>
            <CustomText style={styles.label}>
              아이디
            </CustomText>
          <TextInput
            placeholder="아이디를 입력하세요"
            style={styles.input}
          />

          <CustomText style={styles.label}>이메일</CustomText>
        <View style={styles.inputRow}>
              <TextInput
                placeholder="readyQ@ready.com"
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
              />

              <CustomButton 
                title="인증" 
                type="primary" 
                style={styles.verifyButtonSmall} 
                onPress={() => { /* 인증 로직 */ }}
              />
            </View>
  
            <CustomText style={styles.label}>
              인증번호
            </CustomText>
          <TextInput
            placeholder="인증번호 6자리를 입력하세요"
            style={styles.input}
          />
  
          <CustomButton title="비밀번호 재설정" type="secondary" onPress={() => navigation.navigate('NewPw')} />
  
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
  
      </View>
    )
  }
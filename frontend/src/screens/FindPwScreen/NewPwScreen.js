import { View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './NewPwStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function NewPwScreen({ navigation }) {
    return (
      
      <View style={styles.container}>
         <Header
                    onBack={() => navigation.goBack()}
                />
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
          />
  
            <CustomText style={styles.label}>
              새 비밀번호 재확인
            </CustomText>
          <TextInput
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            style={styles.input}
          />
  
          <CustomButton title="변경하기" type="secondary" />
  
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
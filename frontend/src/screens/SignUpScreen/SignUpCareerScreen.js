import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { styles } from './SignUpCareerStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import { signUp } from '../../api/auth'

export default function SignUpCareerScreen({ navigation, route }) {
  const { formData } = route.params
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const careers = [
    {
      title: '신입',
      desc: '경력 없이 첫 취업을 준비 중이에요',
    },
    {
      title: '주니어 (경력 1~3년)',
      desc: '실무 경험을 쌓아가는 단계예요',
    },
    {
      title: '미들 (경력 4~7년)',
      desc: '독립적으로 업무를 수행해요',
    },
    {
      title: '시니어 (경력 8년 이상)',
      desc: '팀을 이끌거나 의사결정을 해요',
    },
    {
      title: '경력 전환',
      desc: '새로운 직무로 지원해요',
    },
  ]

  return (
    <View style={styles.container}>
      
      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>

          <CustomText weight="bold" style={styles.title}>
            면접 기준이 될 경력을 선택해 주세요.
          </CustomText>

          {careers.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                selected === item.title && styles.selectedCard
              ]}
              onPress={() => setSelected(item.title)}
            >
              <CustomText
                weight="medium"
                style={[
                  styles.cardTitle,
                  selected === item.title && styles.selectedTitle
                ]}
              >
                {item.title}
              </CustomText>

              <CustomText style={styles.cardDesc}>
                {item.desc}
              </CustomText>
            </TouchableOpacity>
          ))}

          <CustomButton
            title={loading ? '처리 중...' : '완료'}
            type="secondary"
            style={styles.button}
            onPress={async () => {
              if (!selected) {
                Alert.alert('알림', '경력을 선택해주세요')
                return
              }
              setLoading(true)
              try {
                await signUp({ ...formData, career: selected })
                Alert.alert('완료', '회원가입이 완료되었습니다', [
                  { text: '확인', onPress: () => navigation.navigate('Login') },
                ])
              } catch (e) {
                Alert.alert('오류', e.message)
              } finally {
                setLoading(false)
              }
            }}
          />

        </View>
      </ScrollView>
    </View>
  )
}
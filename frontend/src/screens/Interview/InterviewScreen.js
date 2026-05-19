import { View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react'
import { styles } from './InterviewStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function InterviewScreen({ navigation }) {
  const [selected, setSelected] = useState(null)

  const options = [
    {
      id: 'basic',
      title: '기본 면접관',
      desc: '부담없이 답변을 연습할 수 있는 기본형 면접',
    },
    {
      id: 'kind',
      title: '친절한 면접관',
      desc: '기본에 충실한, 편안한 분위기의 정석 면접 질문'
    },
    {
      id: 'strict',
      title: '압박 면접관',
      desc: '날카로운 질문으로 실전 대비 훈련',
    },
    {
      id: 'logic',
      title: '논리 검증형 면접관',
      desc: '답변의 논리성과 실행력을 집중적으로 검증하는 면접'
    }
  ]
    return (
      
      <View style={styles.container}>
         <Header
            onBack={() => navigation.goBack()}
        />
        
        <View style={styles.topSection}>
          <CustomText weight="bold" style={styles.label1}>
             AI 면접을 시작하기 전,
          </CustomText>
          <CustomText weight="bold" style={styles.label2}>
             면접 분위기 설정을 먼저 해주세요
          </CustomText>
          <CustomText weight="semibold" style={styles.label3}>
            면접 분위기를 선택하면 AI 면접관의 질문 스타일이 달라져요.
          </CustomText>
        </View>


        <View style={styles.cardSection}>
          {options.map((item) => {
            const isSelected = selected === item.id

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  selected && !isSelected && styles.cardDisabled,
                ]}
                onPress={() => setSelected(item.id)}
              >
                <CustomText 
                weight="bold" 
                style={[
                  styles.cardTitle,
                  selected && !isSelected && styles.disabledText,
                  ]}>
                  {item.title}
                </CustomText>

                <CustomText style={[
                  styles.cardDesc,
                  selected && !isSelected && styles.disabledText,
                ]}>
                  {item.desc}
                </CustomText>
              </TouchableOpacity>
            )
          })}
        </View>
        
        <CustomButton
          title="다음"
          type={selected ? 'primary' : 'secondary'}
          disabled={!selected}
          style={styles.Button}
          onPress={() => {
            if (!selected) return
            navigation.navigate('InterviewTitle', {
              selectedType: selected, // 면접관 성격 선택 id값 전달
            })
          }}
        />
  
      </View>
    )
  }
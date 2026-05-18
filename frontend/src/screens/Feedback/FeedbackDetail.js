import { View, Image, TextInput, ScrollView, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react'
import { styles } from './FeedbackDetailStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'
import AnalysisSection from '../../components/AnalysisSection'


export default function FeedbackDetail({ navigation }) {

  const getGradeInfo = (score) => {
    if (score >= 90) {
      return { label: '우수', color: '#3281FF' } // 파랑
    } else if (score >= 70) {
      return { label: '양호', color: '#22C55E' } // 초록
    } else if (score >= 50) {
      return { label: '보통', color: '#ff8630' } // 주황
    } else if (score >= 30) {
      return { label: '주의', color: '#EAB308' } // 노랑
    } else {
      return { label: '부족', color: '#ff4848' } // 빨강
    }
  }


  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        onHome={() => navigation.navigate('Home')}
        showHome={true}
        icon={require('../../../assets/icons/home2.png')}
        title="세부 피드백"
        />
        
    </View>

    
  )
}
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { styles } from './SignUpJobStyles'
import CustomText from '../../components/CustomText'
import CustomButton from '../../components/CustomButton'
import Header from '../../components/Header'

export default function SignUpJobScreen({ navigation, route }) {
  const { formData } = route.params
  const [selectedMain, setSelectedMain] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)

  const jobData = {
  '기획·전략': [
    '사업기획', '서비스기획', '전략기획', 'PM', '컨설팅'
  ],

  '법무·사무·총무': [
    '총무', '법무', '사무보조', '문서관리', '비서'
  ],

  '인사·HR': [
    '인사관리', '채용', '노무', '교육기획'
  ],

  '회계·세무': [
    '회계', '경리', '세무', '재무', '감사'
  ],

  '마케팅·광고·MD': [
    '마케팅', '퍼포먼스 마케팅', '브랜드 마케팅',
    '광고기획', 'MD', 'CRM'
  ],

  'AI·개발·데이터': [
    '프론트엔드', '백엔드', '풀스택',
    '모바일앱', '데이터분석', 'AI/ML', 'DevOps'
  ],

  '디자인': [
    'UI/UX', '그래픽디자인', '웹디자인',
    '영상디자인', '제품디자인'
  ],

  '물류·무역': [
    '물류관리', '무역사무', '수출입관리', '유통관리'
  ],

  '운전·운송·배송': [
    '배송기사', '운송기사', '택배', '물류운전'
  ],

  '영업': [
    'B2B영업', 'B2C영업', '영업관리',
    '기술영업', '해외영업'
  ],

  '고객상담·TM': [
    '고객상담', '콜센터', 'CS', '인바운드', '아웃바운드'
  ],

  '금융·보험': [
    '은행', '보험', '증권', '자산관리', '리스크관리'
  ],

  '식·음료': [
    '조리사', '바리스타', '제과제빵', '주방보조'
  ],

  '고객서비스·리테일': [
    '매장관리', '판매직', '서비스직', '리테일관리'
  ],

  '엔지니어링·설계': [
    '기계설계', '전기설계', '전자설계', 'CAD'
  ],

  '제조·생산': [
    '생산직', '품질관리', '공정관리', '설비관리'
  ],

  '교육': [
    '강사', '교사', '교육기획', '학원강사'
  ],

  '건축·시설': [
    '건축설계', '시설관리', '시공', '안전관리'
  ],

  '의료·바이오': [
    '간호사', '의료기사', '연구원', '임상시험'
  ],

  '미디어·문화·스포츠': [
    'PD', '영상편집', '콘텐츠제작', '작가'
  ],

  '공공·복지': [
    '공무원', '사회복지사', '행정직'
  ],
}

  const currentList = selectedMain
    ? jobData[selectedMain]
    : Object.keys(jobData)

  return (
    <View style={styles.container}>
      
      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>

          <CustomText weight="bold" style={styles.title}>
            어떤 직무로 면접을 볼까요?
          </CustomText>

          {/* 선택 박스 */}
          <TouchableOpacity style={styles.selectBox}>
            <CustomText style={styles.selectText}>
            {selectedSub
                ? `${selectedMain} > ${selectedSub}`
                : selectedMain
                ? selectedMain
                : '직무를 선택해주세요'}
            </CustomText>
            </TouchableOpacity>

          <View style={styles.jobContainer}>

            {selectedMain && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setSelectedMain(null)
                  setSelectedSub(null)
                }}
              >
                <CustomText style={styles.backText}>← 직무 선택으로 돌아가기</CustomText>
              </TouchableOpacity>
            )}

            <View style={styles.grid}>
              {currentList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.jobItem,
                    selectedSub === item && styles.selectedItem
                  ]}
                  onPress={() => {
                    if (!selectedMain) {
                      setSelectedMain(item) // 대분류 선택 → 리스트 변경
                    } else {
                      setSelectedSub(item) // 소분류 선택
                    }
                  }}
                >
                  <CustomText
                    style={[
                      styles.jobText,
                      selectedSub === item && styles.selectedText
                    ]}
                  >
                    {item}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          <CustomButton
            title="다음"
            type="secondary"
            style={styles.button}
            onPress={() => {
              if (!selectedSub) {
                Alert.alert('알림', '직무를 선택해주세요')
                return
              }
              const jobTitle = `${selectedMain} > ${selectedSub}`
              navigation.navigate('SignUpCareer', { formData: { ...formData, jobTitle } })
            }}
          />

        </View>
      </ScrollView>
    </View>
  )
}
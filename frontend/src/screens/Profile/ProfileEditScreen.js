import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import styles from './ProfileEditStyles';
import { useUser } from '../../context/UserContext';

const JOB_DATA = {
  '기획·전략': ['사업기획', '서비스기획', '전략기획', 'PM', '컨설팅'],
  '법무·사무·총무': ['총무', '법무', '사무보조', '문서관리', '비서'],
  '인사·HR': ['인사관리', '채용', '노무', '교육기획'],
  '회계·세무': ['회계', '경리', '세무', '재무', '감사'],
  '마케팅·광고·MD': ['마케팅', '퍼포먼스 마케팅', '브랜드 마케팅', '광고기획', 'MD', 'CRM'],
  'AI·개발·데이터': ['프론트엔드', '백엔드', '풀스택', '모바일앱', '데이터분석', 'AI/ML', 'DevOps'],
  '디자인': ['UI/UX', '그래픽디자인', '웹디자인', '영상디자인', '제품디자인'],
  '물류·무역': ['물류관리', '무역사무', '수출입관리', '유통관리'],
  '운전·운송·배송': ['배송기사', '운송기사', '택배', '물류운전'],
  '영업': ['B2B영업', 'B2C영업', '영업관리', '기술영업', '해외영업'],
  '고객상담·TM': ['고객상담', '콜센터', 'CS', '인바운드', '아웃바운드'],
  '금융·보험': ['은행', '보험', '증권', '자산관리', '리스크관리'],
  '식·음료': ['조리사', '바리스타', '제과제빵', '주방보조'],
  '고객서비스·리테일': ['매장관리', '판매직', '서비스직', '리테일관리'],
  '엔지니어링·설계': ['기계설계', '전기설계', '전자설계', 'CAD'],
  '제조·생산': ['생산직', '품질관리', '공정관리', '설비관리'],
  '교육': ['강사', '교사', '교육기획', '학원강사'],
  '건축·시설': ['건축설계', '시설관리', '시공', '안전관리'],
  '의료·바이오': ['간호사', '의료기사', '연구원', '임상시험'],
  '미디어·문화·스포츠': ['PD', '영상편집', '콘텐츠제작', '작가'],
  '공공·복지': ['공무원', '사회복지사', '행정직'],
};

const CAREER_LIST = ['신입', '1년 미만', '1~3년', '3~5년', '5~10년', '10년 이상'];

export default function ProfileEditScreen({ navigation }) {
  const { userInfo, updateUserInfo } = useUser();

  const [nickname, setNickname] = useState(userInfo.nickname);
  const [selectedMain, setSelectedMain] = useState(userInfo.mainJob);
  const [selectedSub, setSelectedSub] = useState(userInfo.subJob);
  const [selectedCareer, setSelectedCareer] = useState(userInfo.career);

  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState('main');
  const [tempMain, setTempMain] = useState(null);
  const [careerModalVisible, setCareerModalVisible] = useState(false);

  const jobLabel = selectedMain && selectedSub
    ? `${selectedMain} > ${selectedSub}`
    : selectedMain || '직무를 선택해주세요';

  const handleSave = () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    updateUserInfo({
      nickname: nickname.trim(),
      mainJob: selectedMain,
      subJob: selectedSub,
      career: selectedCareer,
    });
    navigation.goBack();
  };

  const handleMainSelect = (main) => {
    setTempMain(main);
    setModalStep('sub');
  };

  const handleSubSelect = (sub) => {
    setSelectedMain(tempMain);
    setSelectedSub(sub);
    setJobModalVisible(false);
    setModalStep('main');
    setTempMain(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 설정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>완료</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 사진 */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nickname[0] || '?'}</Text>
            </View>
            <View style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 닉네임 */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#BEC8D6"
          />
        </View>

        {/* 희망 직무 */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>희망 직무</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => { setModalStep('main'); setTempMain(null); setJobModalVisible(true); }}
          >
            <Text style={styles.dropdownText}>{jobLabel}</Text>
            <Image
              source={require('../../../assets/icons/arrow_back_ios.png')}
              style={styles.dropdownArrow}
            />
          </TouchableOpacity>
        </View>

        {/* 경력 설정 */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>경력 설정</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCareerModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{selectedCareer}</Text>
            <Image
              source={require('../../../assets/icons/arrow_back_ios.png')}
              style={styles.dropdownArrow}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 직무 선택 모달 */}
      <Modal visible={jobModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              {modalStep === 'sub' ? (
                <TouchableOpacity onPress={() => { setModalStep('main'); setTempMain(null); }}>
                  <Image source={require('../../../assets/icons/arrow.png')} style={styles.backIcon} />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 24 }} />
              )}
              <Text style={styles.modalTitle}>
                {modalStep === 'main' ? '직무 선택' : tempMain}
              </Text>
              <TouchableOpacity onPress={() => { setJobModalVisible(false); setModalStep('main'); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalStep === 'main' ? Object.keys(JOB_DATA) : JOB_DATA[tempMain]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    modalStep === 'main' && selectedMain === item && styles.modalItemActive,
                    modalStep === 'sub' && selectedSub === item && styles.modalItemActive,
                  ]}
                  onPress={() => modalStep === 'main' ? handleMainSelect(item) : handleSubSelect(item)}
                >
                  <Text style={[
                    styles.modalItemText,
                    modalStep === 'main' && selectedMain === item && styles.modalItemTextActive,
                    modalStep === 'sub' && selectedSub === item && styles.modalItemTextActive,
                  ]}>
                    {item}
                  </Text>
                  {modalStep === 'main' && (
                    <Image
                      source={require('../../../assets/icons/arrow_back_ios.png')}
                      style={styles.modalArrow}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* 경력 선택 모달 */}
      <Modal visible={careerModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ width: 24 }} />
              <Text style={styles.modalTitle}>경력 선택</Text>
              <TouchableOpacity onPress={() => setCareerModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CAREER_LIST}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedCareer === item && styles.modalItemActive]}
                  onPress={() => { setSelectedCareer(item); setCareerModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, selectedCareer === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
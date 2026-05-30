import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getToken } from '../../utils/storage';
import { BASE_URL } from '../../api/client';
import { useUser } from '../../context/UserContext';


export default function PostWriteScreen({ navigation, route }) {
  const { category } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { userInfo } = useUser();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      const token = await getToken();

      console.log('현재 내 토큰:', token);
      //토큰 없을 시 예외
      if (!token) {
        Alert.alert('알림', '로그인이 필요한 서비스입니다.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          boardType: category,
          category: userInfo.mainJob && userInfo.subJob
            ? `${userInfo.mainJob} > ${userInfo.subJob}`
            : userInfo.mainJob || 'UXUI',  // ← 'UXUI' 대신 유저 직무
          title: title.trim(),
          content: content.trim(),
          isAnonymous: false
        })
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        console.log('서버 응답:', data);
      } else {
        const text = await response.text();
        console.log('서버에서 HTML이나 텍스트를 줬음', text);
        throw new Error('서버에서 JSON이 아닌 데이터를 반환.');
      }

      if (!response.ok) {
        throw new Error('서버 응답 에러');
      }

      Alert.alert('성공', '게시글이 등록되었습니다!');
      navigation.navigate('Community');

    } catch (error) {
      console.error('[API 에러] 글쓰기 실패:', error);
      Alert.alert('오류', '게시글 작성에 실패했습니다.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>글쓰기</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={[
              styles.submitBtn,
              (!title.trim() || !content.trim()) && styles.submitBtnDisabled,
            ]}>
              올리기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력해주세요"
          placeholderTextColor="#BEC8D6"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />

        <View style={styles.divider} />

        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력해주세요"
          placeholderTextColor="#BEC8D6"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5EAF0',
  },
  backBtn: { fontSize: 20, color: '#00041C' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#00041C' },
  submitBtn: { fontSize: 15, fontWeight: '600', color: '#3281FF' },
  submitBtnDisabled: { color: '#BEC8D6' },
  categoryRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: { fontSize: 13, color: '#3281FF', fontWeight: '600' },
  titleInput: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#00041C',
  },
  divider: { height: 0.5, backgroundColor: '#E5EAF0', marginHorizontal: 20 },
  contentInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 15,
    color: '#00041C',
    lineHeight: 24,
  },
});
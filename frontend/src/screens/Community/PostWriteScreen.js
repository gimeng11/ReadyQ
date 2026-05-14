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
import { usePosts } from '../../context/PostContext';

export default function PostWriteScreen({ navigation, route }) {
  const { category } = route.params;
  const { addPost } = usePosts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    addPost({
      id: Date.now().toString(),
      tag: category,
      title: title.trim(),
      preview: content.trim().slice(0, 40) + (content.length > 40 ? '...' : ''),
      category: 'UXUI',
      date: `${month}.${day}`,
      views: 0,
      likes: 0,
      comments: 0,
      content: content.trim(),
    });

    navigation.navigate('Community');
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
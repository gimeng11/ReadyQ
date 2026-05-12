import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePosts } from '../../context/PostContext';

export default function PostDetailScreen({ navigation, route }) {
  const item = route.params?.item;
  const { toggleScrap, isScrapped } = usePosts();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);

  if (!item) return null;

  const scrapped = isScrapped(item.id);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <TouchableOpacity onPress={() => toggleScrap(item.id)}>
            <Image
              source={require('../../../assets/icons/save.png')}
              style={[styles.scrapIcon, scrapped && styles.scrapIconActive]}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 게시글 본문 */}
          <View style={styles.postBody}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>

            {/* 작성자 정보 */}
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>레</Text>
              </View>
              <View>
                <Text style={styles.authorName}>레디큐</Text>
                <Text style={styles.postMeta}>
                  {item.category} · {item.date} · 조회 {item.views}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 본문 내용 */}
            <Text style={styles.postContent}>
              {item.content || item.preview}
            </Text>

            {/* 좋아요 / 댓글 수 */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setLiked(!liked)}
              >
                <Text style={[styles.actionIcon, liked && { color: '#3281FF' }]}>♥</Text>
                <Text style={[styles.actionCount, liked && { color: '#3281FF' }]}>
                  {liked ? item.likes + 1 : item.likes}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionCount}>{item.comments}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerThick} />

          {/* 댓글 목록 */}
          <View style={styles.commentSection}>
            <Text style={styles.commentHeader}>댓글 {item.comments}</Text>
            {[...Array(item.comments)].map((_, i) => (
              <View key={i} style={styles.commentItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>유</Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentTop}>
                    <Text style={styles.commentAuthor}>유저{i + 1}</Text>
                    <Text style={styles.commentDate}>02.03</Text>
                  </View>
                  <Text style={styles.commentText}>
                    {i === 0 ? '좋은 정보 감사합니다!' : '도움이 많이 됐어요 :)'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 댓글 입력창 */}
        <View style={styles.commentInputBar}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력해주세요"
            placeholderTextColor="#BEC8D6"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !comment.trim() && { opacity: 0.4 }]}
            disabled={!comment.trim()}
          >
            <Text style={styles.sendBtnText}>전송</Text>
          </TouchableOpacity>
        </View>
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
  scrapIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#BEC8D6' },
  scrapIconActive: { tintColor: '#3281FF' },
  postBody: { padding: 20 },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  tagText: { fontSize: 12, color: '#3281FF', fontWeight: '600' },
  postTitle: { fontSize: 18, fontWeight: '700', color: '#00041C', marginBottom: 16, lineHeight: 26 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#3281FF' },
  authorName: { fontSize: 14, fontWeight: '600', color: '#00041C' },
  postMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  divider: { height: 0.5, backgroundColor: '#E5EAF0', marginVertical: 16 },
  postContent: { fontSize: 15, color: '#00041C', lineHeight: 24 },
  actionRow: {
    flexDirection: 'row', gap: 16, marginTop: 24,
    paddingTop: 16, borderTopWidth: 0.5, borderTopColor: '#E5EAF0',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 16, color: '#64748B' },
  actionCount: { fontSize: 14, color: '#64748B' },
  dividerThick: { height: 8, backgroundColor: '#F8FAFC' },
  commentSection: { padding: 20 },
  commentHeader: { fontSize: 15, fontWeight: '700', color: '#00041C', marginBottom: 16 },
  commentItem: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  commentContent: { flex: 1 },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#00041C' },
  commentDate: { fontSize: 12, color: '#BEC8D6' },
  commentText: { fontSize: 14, color: '#00041C', lineHeight: 20 },
  commentInputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: '#E5EAF0', gap: 10,
  },
  commentInput: {
    flex: 1, height: 40, backgroundColor: '#F8FAFC',
    borderRadius: 20, paddingHorizontal: 16, fontSize: 14, color: '#00041C',
  },
  sendBtn: {
    backgroundColor: '#3281FF', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  sendBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
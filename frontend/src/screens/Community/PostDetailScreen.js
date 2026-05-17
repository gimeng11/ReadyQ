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
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { usePosts } from '../../context/PostContext';

export default function PostDetailScreen({ navigation, route }) {
  const item = route.params?.item;
  const { toggleScrap, isScrapped, deletePost, updatePost, posts, addComment, deleteComment, getComments } = usePosts();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editContent, setEditContent] = useState(item?.content || '');

  if (!item) return null;

  const currentItem = posts.find((p) => p.id === item.id) || item;
  const commentList = getComments(item.id);
  const scrapped = isScrapped(item.id);

  const handleMorePress = () => {
    if (!currentItem.isMyPost) return;
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['수정', '삭제', '닫기'], destructiveButtonIndex: 1, cancelButtonIndex: 2 },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          setEditTitle(currentItem.title);
          setEditContent(currentItem.content);
          setEditMode(true);
        } else if (buttonIndex === 1) {
          Alert.alert('삭제', '게시글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '삭제', style: 'destructive', onPress: () => { deletePost(item.id); navigation.goBack(); } },
          ]);
        }
      }
    );
  };

  const handleCommentMorePress = (commentId) => {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['삭제', '닫기'], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          Alert.alert('삭제', '댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '삭제', style: 'destructive', onPress: () => deleteComment(item.id, commentId) },
          ]);
        }
      }
    );
  };

  const handleEditSubmit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
      return;
    }
    updatePost(item.id, { title: editTitle.trim(), content: editContent.trim() });
    setEditMode(false);
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    addComment(item.id, comment.trim());
    setComment('');
  };

  if (editMode) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setEditMode(false)}>
              <Text style={styles.backBtn}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>게시글 수정</Text>
            <TouchableOpacity onPress={handleEditSubmit}>
              <Text style={styles.submitBtn}>완료</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentItem.tag}</Text>
            </View>
          </View>
          <TextInput
            style={styles.titleInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="제목을 입력해주세요"
            placeholderTextColor="#BEC8D6"
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.contentInput}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="내용을 입력해주세요"
            placeholderTextColor="#BEC8D6"
            multiline
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => toggleScrap(item.id)} style={styles.headerBtn}>
              <Image
                source={require('../../../assets/icons/save.png')}
                style={[styles.scrapIcon, scrapped && styles.scrapIconActive]}
              />
            </TouchableOpacity>
            {currentItem.isMyPost && (
              <TouchableOpacity onPress={handleMorePress} style={styles.headerBtn}>
                <Text style={styles.moreBtn}>⋯</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.postBody}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{currentItem.tag}</Text>
            </View>
            <Text style={styles.postTitle}>{currentItem.title}</Text>

            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>레</Text>
              </View>
              <View>
                <Text style={styles.authorName}>레디큐</Text>
                <Text style={styles.postMeta}>
                  {currentItem.category} · {currentItem.date} · 조회 {currentItem.views}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.postContent}>{currentItem.content || currentItem.preview}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setLiked(!liked)}>
                <Text style={[styles.actionIcon, liked && { color: '#3281FF' }]}>♥</Text>
                <Text style={[styles.actionCount, liked && { color: '#3281FF' }]}>
                  {liked ? currentItem.likes + 1 : currentItem.likes}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionCount}>{commentList.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerThick} />

          {/* 댓글 목록 */}
          <View style={styles.commentSection}>
            <Text style={styles.commentHeader}>댓글 {commentList.length}</Text>
            {commentList.length === 0 ? (
              <Text style={styles.emptyComment}>첫 댓글을 남겨보세요!</Text>
            ) : (
              commentList.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{c.author[0]}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentTop}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <View style={styles.commentTopRight}>
                        <Text style={styles.commentDate}>{c.date}</Text>
                        {c.isMyComment && (
                          <TouchableOpacity onPress={() => handleCommentMorePress(c.id)}>
                            <Text style={styles.commentMore}>⋯</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))
            )}
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
            onPress={handleSendComment}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#E5EAF0',
  },
  backBtn: { fontSize: 20, color: '#00041C' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#00041C' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { padding: 4 },
  scrapIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#BEC8D6' },
  scrapIconActive: { tintColor: '#3281FF' },
  moreBtn: { fontSize: 20, color: '#00041C', letterSpacing: 1 },
  submitBtn: { fontSize: 15, fontWeight: '600', color: '#3281FF' },
  categoryRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EEF4FF',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  categoryText: { fontSize: 13, color: '#3281FF', fontWeight: '600' },
  titleInput: {
    paddingHorizontal: 20, paddingVertical: 14,
    fontSize: 17, fontWeight: '600', color: '#00041C',
  },
  contentInput: {
    flex: 1, paddingHorizontal: 20, paddingTop: 16,
    fontSize: 15, color: '#00041C', lineHeight: 24,
  },
  postBody: { padding: 20 },
  tagBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EEF4FF',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10,
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
  emptyComment: { fontSize: 13, color: '#BEC8D6', textAlign: 'center', marginTop: 20 },
  commentItem: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  commentContent: { flex: 1 },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentTopRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#00041C' },
  commentDate: { fontSize: 12, color: '#BEC8D6' },
  commentMore: { fontSize: 14, color: '#64748B' },
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
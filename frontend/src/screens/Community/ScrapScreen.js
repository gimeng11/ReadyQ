import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePosts } from '../../context/PostContext';

const SCRAP_TABS = ['기업 공고', '게시글'];

export default function ScrapScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('게시글');
  const { loadMyActivities, scrappedPosts } = usePosts();
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        await loadMyActivities('scrapped');
        setLoading(false);
      };
      fetchData();
    }, [])
  );

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
        <Text style={styles.headerTitle}>스크랩</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <View style={styles.tabGroup}>
          {SCRAP_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabBorderLine} />
      </View>

      {/* 내용 */}
      {activeTab === '게시글' ? (
        loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color="#3281FF" />
          </View>
        ) : (
          <FlatList
            data={scrappedPosts}
            keyExtractor={(item) => item.id?.toString()}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>스크랩한 게시글이 없어요</Text>
                <Text style={styles.emptySubText}>게시글에서 북마크를 눌러보세요</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { item })}>
                <View style={styles.postItem}>
                  <View style={styles.postTop}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{item.tag || item.boardType}</Text>
                    </View>
                    <Image
                      source={require('../../../assets/icons/save.png')}
                      style={styles.scrapIcon}
                    />
                  </View>
                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postPreview}>{item.preview || item.content?.slice(0, 40)}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.metaText}>{item.category || 'UXUI'}</Text>
                    <Text style={styles.metaText}> ・ </Text>
                    <Text style={styles.metaText}>{item.date || item.createdAt?.slice(0, 10)}</Text>
                    <Text style={styles.metaText}> ・ </Text>
                    <Text style={styles.metaText}>조회 {item.views || 0}</Text>
                    <View style={styles.statRow}>
                      <Text style={styles.statText}>♡ {item.likes || item.likeCount || 0}</Text>
                      <Text style={styles.statText}>💬 {item.comments || item.commentCount || 0}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>스크랩한 기업 공고가 없어요</Text>
          <Text style={styles.emptySubText}>관심 기업 공고를 저장해보세요</Text>
        </View>
      )}
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
  backIcon: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#00041C' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#00041C' },
  tabContainer: { paddingHorizontal: 20 },
  tabGroup: { flexDirection: 'row' },
  tabItem: { marginRight: 24, paddingVertical: 14, position: 'relative' },
  tabText: { fontSize: 15, color: '#BEC8D6', fontWeight: '500' },
  activeTabText: { color: '#00041C', fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#00041C', borderRadius: 1,
  },
  tabBorderLine: { height: 0.5, backgroundColor: '#E5EAF0' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#BEC8D6' },
  postItem: { paddingHorizontal: 20, paddingTop: 16 },
  postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tagBadge: { backgroundColor: '#EEF4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#3281FF', fontWeight: '600' },
  scrapIcon: { width: 18, height: 18, resizeMode: 'contain', tintColor: '#3281FF' },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#00041C', marginBottom: 6 },
  postPreview: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 10 },
  postMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#64748B' },
  statRow: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  statText: { fontSize: 12, color: '#64748B' },
  divider: { height: 0.5, backgroundColor: '#E5EAF0', marginTop: 14 },
});
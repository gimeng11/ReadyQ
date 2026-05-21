import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import BottomTab from '../../components/BottomTab';
import styles from './CommunityStyles';
import { BASE_URL } from '../../api/client';

const TABS = ['인기', '면접 연습', '꿀팁', '취준'];

function PostCard({ item }) {
  return (
    <View style={styles.frameGroup}>
      <View style={styles.frameContainer}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag || item.boardType}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPreview}>{item.preview || item.content?.slice(0, 40)}</Text>
      </View>
      <View style={styles.frameView}>
        <View style={styles.uxuiParent}>
          <Text style={styles.uxui}>{item.category || 'UXUI'}</Text>
          <Text style={styles.uxui}> ・ </Text>
          <Text style={styles.uxui}>{item.date || item.createdAt?.slice(0, 10)}</Text>
          <Text style={styles.uxui}> ・ </Text>
          <Text style={styles.uxui}>조회 {item.views || 0}</Text>
        </View>
        <View style={styles.frameParent2}>
          <View style={styles.statFrame}>
            <Image
              source={require('../../../assets/icons/thumbs.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statText}>{item.likes || item.likeCount || 0}</Text>
          </View>
          <View style={styles.statFrame}>
            <Image
              source={require('../../../assets/icons/community.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statText}>{item.comments || item.commentCount || 0}</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('인기');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const url = activeTab === '인기'
        ? `${BASE_URL}/api/boards`
        : `${BASE_URL}/api/boards?boardType=${activeTab}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let result = Array.isArray(data) ? data : data.content || [];
        // 인기탭은 좋아요 10개 이상만
        if (activeTab === '인기') {
          result = result.filter((p) => (p.likes || p.likeCount || 0) >= 10);
        }
        setDbPosts(result);
      }
    } catch (error) {
      console.error('[API 에러] 게시글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, [activeTab])
  );

  const filteredPosts = useMemo(() => {
    let result = dbPosts;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.preview?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [dbPosts, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 상단 검색바 */}
      <View style={styles.topBar}>
        <View style={styles.searchTextholderParent}>
          <View style={styles.searchTextholder}>
            <Image
              source={require('../../../assets/icons/search.png')}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="게시글을 검색하세요"
              placeholderTextColor="#BEC8D6"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => navigation.navigate('Scrap')}
          >
            <Image
              source={require('../../../assets/icons/save.png')}
              style={styles.bookmarkIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 네비게이션 */}
      <View style={styles.communityNav}>
        <View style={styles.tabGroup}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabItem}
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

      {/* 게시글 리스트 */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id?.toString()}
            ListHeaderComponent={
              searchQuery.trim() ? (
                <Text style={styles.sectionTitle}>
                  '{searchQuery}' 검색 결과 ({filteredPosts.length}건)
                </Text>
              ) : (
                <Text style={styles.sectionTitle}>
                  {activeTab === '인기' ? '오늘의 인기글 🔥' : `${activeTab} 게시글`}
                </Text>
              )
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: '#BEC8D6', marginTop: 60, fontSize: 14 }}>
                {activeTab === '인기' ? '아직 인기글이 없어요 (좋아요 10개 이상)' :
                  searchQuery.trim() ? '검색 결과가 없어요' : '아직 게시글이 없어요'}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { item })}>
                <PostCard item={item} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.postButton}
          onPress={() => navigation.navigate('PostSelect')}
        >
          <Text style={styles.postButtonText}>+ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      <BottomTab navigation={navigation} routeName="Community" />
    </View>
  );
}
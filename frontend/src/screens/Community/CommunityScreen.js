import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import BottomTab from '../../components/BottomTab';
import styles from './CommunityStyles';

const TABS = ['인기', '면접 연습', '꿀팁', '취준'];

const DUMMY_POSTS = [
  {
    id: '1',
    tag: '꿀팁',
    title: '대기업 합격한 사람의 면접 꿀팁!',
    preview: '안녕하세요. 얼마전에 대기업에 합격했는데요,, 많은분들이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 5,
  },
  {
    id: '2',
    tag: '면접',
    title: '내일이 면접날인데,',
    preview: '어떤옷을 입어야할지 모르겠어요. 도와주세요!!',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 5,
  },
  {
    id: '3',
    tag: '꿀팁',
    title: '면접 꿀팁 드리겠습니다',
    preview: '안녕하세요. 얼마전에 대기업에 합격했는데요,, 많은분들이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 5,
  },
  {
    id: '4',
    tag: '면접 연습',
    title: '저랑 면접 연습할 분 구해요..',
    preview: '안녕하세요. 이제 합격까지 면접만 남았는데, 면접이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 5,
  },
];

function PostCard({ item }) {
  return (
    <View style={styles.frameGroup}>
      <View style={styles.frameContainer}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPreview}>{item.preview}</Text>
      </View>
      <View style={styles.frameView}>
        <View style={styles.uxuiParent}>
          <Text style={styles.uxui}>{item.category}</Text>
          <Text style={styles.uxui}> ・ </Text>
          <Text style={styles.uxui}>{item.date}</Text>
          <Text style={styles.uxui}> ・ </Text>
          <Text style={styles.uxui}>조회 {item.views}</Text>
        </View>
        <View style={styles.frameParent2}>
          <View style={styles.statFrame}>
            <Text style={styles.statIcon}>👍</Text>
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statFrame}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('인기');

  return (
    <View style={styles.container}>

      {/* 상단 검색바 */}
      <View style={styles.topBar}>
        <View style={styles.searchTextholderParent}>
          <View style={styles.searchTextholder}>
            <Text style={styles.searchIconText}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="게시글을 검색하세요"
              placeholderTextColor="#BEC8D6"
            />
          </View>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 네비게이션 */}
      {/* 탭 네비게이션 */}
<View style={styles.communityNav}>
  <View style={styles.tabGroup}>
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => setActiveTab(tab)}
        style={styles.tabItem}
      >
        <Text style={[
          styles.tabText,
          activeTab === tab && styles.activeTabText,
        ]}>
          {tab}
        </Text>
        {activeTab === tab && <View style={styles.tabUnderline} />}
      </TouchableOpacity>
    ))}
  </View>
  <View style={styles.tabBorderLine} />
</View>

      {/* 게시글 리스트 + FAB */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={DUMMY_POSTS}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>오늘의 인기글 🔥</Text>
          }
          renderItem={({ item }) => <PostCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>+ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      <BottomTab navigation={navigation} routeName="Community" />
    </View>
  );
}
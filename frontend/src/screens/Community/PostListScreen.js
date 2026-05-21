import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { usePosts } from '../../context/PostContext';
import styles from './PostListStyles';

export default function PostListScreen({ navigation, route }) {
  const { type } = route.params; // 'liked' | 'myPosts' | 'myComments'
  const { loadMyActivities, myPosts, likedPosts, commentedPosts } = usePosts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadMyActivities(type);
      setLoading(false);
    };
    fetchData();
  }, [type]);

  const getTitle = () => {
    if (type === 'liked') return '좋아요';
    if (type === 'myPosts') return '내가 쓴 글';
    if (type === 'myComments') return '댓글 단 글';
    return '';
  };

  const getData = () => {
    if (type === 'myPosts') return myPosts;
    if (type === 'liked') return likedPosts;
    if (type === 'myComments') return commentedPosts;
    return [];
  };

  const data = getData();

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
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color="#3281FF" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {type === 'liked' && '좋아요한 게시글이 없어요'}
                {type === 'myPosts' && '작성한 글이 없어요'}
                {type === 'myComments' && '댓글 단 글이 없어요'}
              </Text>
              <Text style={styles.emptySubText}>커뮤니티에서 활동해보세요</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postItem}
              onPress={() => navigation.navigate('PostDetail', { item })}
            >
              <View style={styles.postTop}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postPreview}>{item.preview}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.metaText}>{item.category}</Text>
                <Text style={styles.metaText}> ・ </Text>
                <Text style={styles.metaText}>{item.date}</Text>
                <Text style={styles.metaText}> ・ </Text>
                <Text style={styles.metaText}>조회 {item.views}</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Image
                      source={require('../../../assets/icons/thumbs.png')}
                      style={styles.statIcon}
                    />
                    <Text style={styles.statText}>{item.likes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Image
                      source={require('../../../assets/icons/community.png')}
                      style={styles.statIcon}
                    />
                    <Text style={styles.statText}>{item.comments}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import { usePosts } from '../../context/PostContext';
import styles from './MyPostsStyles';
import { useIsFocused } from '@react-navigation/native';

export default function MyPostsScreen({ navigation }) {
  const { myPosts, loadMyActivities } = usePosts();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadMyActivities('myPosts');
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/arrow_back_ios.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내가 쓴 글</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>작성한 글이 없어요</Text>
            <Text style={styles.emptySubText}>커뮤니티에서 글을 써보세요</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => navigation.navigate('PostDetail', { item })}
          >
            <View style={styles.postTop}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag || item.boardType}</Text>
              </View>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postPreview}>{item.content || item.preview}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.metaText}>{item.category || item.tag}</Text>
              <Text style={styles.metaText}> ・ </Text>
              <Text style={styles.metaText}>{item.date}</Text>
              <Text style={styles.metaText}> ・ </Text>
              <Text style={styles.metaText}>조회 {item.views}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statText}>♡ {item.likes}</Text>
                <Text style={styles.statText}>💬 {item.comments || 0}</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
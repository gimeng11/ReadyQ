import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import BottomTab from '../../components/BottomTab';
import styles from './ProfileStyles';
import { usePosts } from '../../context/PostContext';
import { useUser } from '../../context/UserContext';

const MENU_SECTIONS = [
  {
    title: '면접',
    items: [
      { icon: require('../../../assets/icons/thumbs.png'), label: '면접 아카이브', screen: 'Archive', params: null },
      { icon: require('../../../assets/icons/save.png'), label: '자소서 첨삭', screen: null, params: null },
    ],
  },
  {
    title: '스펙 인증 및 이력서',
    items: [
      { icon: require('../../../assets/icons/Certification.png'), label: '스펙 인증 및 이력서', screen: null, params: null },
    ],
  },
  {
    title: '커뮤니티',
    items: [
      { icon: require('../../../assets/icons/thumbs.png'), label: '좋아요', screen: 'PostList', params: { type: 'liked' } },
      { icon: require('../../../assets/icons/save.png'), label: '스크랩', screen: 'Scrap', params: null },
      { icon: require('../../../assets/icons/pencil.png'), label: '내가 쓴 글', screen: 'PostList', params: { type: 'myPosts' } },
      { icon: require('../../../assets/icons/comment.png'), label: '댓글 단 글', screen: 'PostList', params: { type: 'myComments' } },
    ],
  },
];

const ArrowIcon = () => (
  <Image
    source={require('../../../assets/icons/arrow_back_ios.png')}
    style={styles.arrowIcon}
  />
);

export default function ProfileScreen({ navigation }) {
  const { userInfo } = useUser();

  const handleMenuPress = (screen, params) => {
    if (!screen) return;
    navigation.navigate(screen, params || {});
  };

  const jobLabel = userInfo.mainJob && userInfo.subJob
    ? `${userInfo.mainJob} > ${userInfo.subJob}`
    : userInfo.mainJob || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 설정 버튼 */}
        <View style={styles.settingRow}>
          <TouchableOpacity>
            <Text style={styles.settingIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* 프로필 카드 */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInfo.nickname[0]}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{userInfo.nickname}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{userInfo.career}</Text>
                </View>
              </View>
              <Text style={styles.profileSub}>{jobLabel}</Text>
            </View>
          </View>
          <ArrowIcon />
        </TouchableOpacity>

        {/* 메뉴 섹션들 */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuPress(item.screen, item.params)}
                  activeOpacity={item.screen ? 0.6 : 1}
                >
                  <View style={styles.menuLeft}>
                    <Image source={item.icon} style={styles.menuIcon} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ArrowIcon />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomTab navigation={navigation} routeName="Profile" />
    </SafeAreaView>
  );
}
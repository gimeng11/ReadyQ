import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export default function BottomTab({ navigation, routeName }) {
  const tabs = [
    {
      name: 'Home',
      label: '홈',
      icon: require('../../assets/icons/home.png'),
    },
    {
      name: 'Community',
      label: '커뮤니티',
      icon: require('../../assets/icons/community.png'),
    },
    {
      name: 'Archive',
      label: '일정관리',
      icon: require('../../assets/icons/archive.png'),
    },
    {
      name: 'Profile',
      label: '프로필',
      icon: require('../../assets/icons/profile.png'),
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = routeName === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Image
              source={tab.icon}
              style={[
                styles.icon,
                { tintColor: isActive ? '#3B82F6' : '#999' },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#3B82F6' : '#999' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
});
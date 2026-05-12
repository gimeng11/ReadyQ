import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const CATEGORIES = ['면접 연습', '꿀팁', '취준', '기타'];

export default function PostSelectScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>커뮤니티 글쓰기</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>게시판을 선택해주세요</Text>
        <Text style={styles.subLabel}>게시판 선택 후 글을 작성할 수 있어요</Text>

        <View style={styles.chipGroup}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selected === cat && styles.chipActive,
              ]}
              onPress={() => setSelected(cat)}
            >
              <Text style={[
                styles.chipText,
                selected === cat && styles.chipTextActive,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
        disabled={!selected}
        onPress={() => navigation.navigate('PostWrite', { category: selected })}
      >
        <Text style={styles.nextBtnText}>다음</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5EAF0',
  },
  backBtn: { fontSize: 18, color: '#00041C' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#00041C' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  label: { fontSize: 18, fontWeight: '700', color: '#00041C', marginBottom: 6 },
  subLabel: { fontSize: 13, color: '#64748B', marginBottom: 28 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5EAF0',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    backgroundColor: '#3281FF',
    borderColor: '#3281FF',
  },
  chipText: { fontSize: 14, color: '#64748B' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  nextBtn: {
    margin: 20,
    backgroundColor: '#3281FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#BEC8D6' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
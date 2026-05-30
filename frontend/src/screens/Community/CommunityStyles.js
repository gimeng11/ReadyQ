import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFF',
    paddingTop: 40,
  },

  /* ── 검색바 ── */
  topBar: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FDFDFF',
  },
  searchTextholderParent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTextholder: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  searchIconText: {
    fontSize: 14,
    marginRight: 8,
  },
  searchIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
},
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },
  bookmarkBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
  width: 24,
  height: 24,
},

communityNav: {
  marginTop: 8,
},
tabGroup: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 0,  // ← 패딩 제거
},
tabItem: {
  flex: 1,               // ← 각 탭이 균등하게 공간 차지
  alignItems: 'center',
  paddingBottom: 8,
  marginRight: 0,        // ← 마진 제거
},
  tabText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#BEC8D6',
  },
  activeTabText: {
    color: '#00041C',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00041C',
    borderRadius: 1,
  },
  tabBorderLine: {
    height: 1,
    backgroundColor: '#EFF0F1',
  },

  /* ── 리스트 ── */
  listContent: {
    paddingHorizontal: 19,
    paddingBottom: 80,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    color: '#000',
    marginTop: 28,
    marginBottom: 20,
  },

  /* ── 카드 ── */
  frameGroup: {
    marginBottom: 20,
  },
  frameContainer: {
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: '#F8F8F8',
    borderRadius: 5,
    paddingHorizontal: 12,
    height: 20,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#00041C',
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },
  frameView: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
  uxuiParent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uxui: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },
  frameParent2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 130,
  },
  statFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statIcon: {
    width: 16,
  height: 16,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFF0F1',
    marginTop: 12,
  },

  /* ── 작성자 행 ── */
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00041C',
  },

  /* ── 경력 뱃지 ── */
  careerBadge: {
    backgroundColor: '#EEF4FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  careerBadgeText: {
    fontSize: 11,
    color: '#3281FF',
    fontWeight: '600',
  },

  /* ── FAB ── */
  postButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    borderRadius: 30,
    backgroundColor: '#3281FF',
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
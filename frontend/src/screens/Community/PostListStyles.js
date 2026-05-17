import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5EAF0',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#00041C',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#00041C' },

  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#BEC8D6' },

  postItem: { paddingHorizontal: 20, paddingTop: 16 },
  postTop: { marginBottom: 8 },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: '#3281FF', fontWeight: '600' },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#00041C', marginBottom: 6 },
  postPreview: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 10 },
  postMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#64748B' },
  statRow: { flexDirection: 'row', gap: 8, marginLeft: 'auto', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statIcon: { width: 14, height: 14, resizeMode: 'contain', tintColor: '#64748B' },
  statText: { fontSize: 12, color: '#64748B' },
  divider: { height: 0.5, backgroundColor: '#E5EAF0', marginTop: 14 },
});
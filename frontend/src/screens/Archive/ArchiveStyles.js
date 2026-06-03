import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
  },
  cardSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 90,
    width: '100%',
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: '#ddd',
  },
  cardPinned: {
    borderColor: '#3281FF',
    borderWidth: 1.5,
    backgroundColor: '#F5F9FF',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  pinnedBadge: {
    fontSize: 11,
    color: '#3281FF',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 4,
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#aaa',
  },
  actionTextActive: {
    color: '#3281FF',
  },
})

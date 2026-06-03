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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  cardScore: {
    fontSize: 13,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1.2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    marginBottom: 18,
    fontFamily: 'Pretendard-Regular',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#ddd',
  },
  modalBtnSave: {
    borderColor: '#3281FF',
    backgroundColor: '#3281FF',
  },
  modalBtnText: {
    fontSize: 14,
    color: '#666',
  },
  modalBtnTextSave: {
    color: '#fff',
  },
})

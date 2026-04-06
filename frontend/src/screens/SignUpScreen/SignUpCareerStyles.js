import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    marginTop: 52,
    flex: 1,
    backgroundColor: '#F8F9FB',
  },

  scrollContainer: {
    paddingBottom: 120,
    alignItems: 'center',
  },

  inner: {
    width: '85%',
  },

  title: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 16,
    marginBottom: 5,
  },

  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
  },

  // ⭐ 선택 상태
  selectedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },

  selectedTitle: {
    color: '#3B82F6',
  },

  button: {
    marginTop: 30,
  },
})
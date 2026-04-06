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
    marginBottom: 20,
  },

  selectBox: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  selectText: {
    color: '#9CA3AF',
  },

  jobContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    backgroundColor: '#fff',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  jobItem: {
    width: '48%',
    paddingVertical: 10,
  },

  jobText: {
    fontSize: 14,
    color: '#111',
  },

  selectedItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },

  selectedText: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  backBtn: {
    marginBottom: 10,
  },

  backText: {
    color: '#3B82F6',
    fontSize: 13,
  },

  button: {
    marginTop: 20,
  },
})
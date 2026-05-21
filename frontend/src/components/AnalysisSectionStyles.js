import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 6, 
    color:'#64748B', 
    paddingVertical: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    marginRight: 6,
    marginTop: 2,
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: '#eee',
  },
})
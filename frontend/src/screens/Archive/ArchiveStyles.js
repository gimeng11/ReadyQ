import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 6,
    color: '#64748B',
  },
})
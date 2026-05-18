import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
    alignItems: 'center',
    overflow: 'hidden',
  },
  topSection: {
    width: '90%',
  },
  label1: {
    fontSize: 18,
    marginBottom: 5,
  },
  label2: {
    fontSize: 20,
    marginBottom: 15,
  },
  label3: {
    fontSize: 14,
    marginBottom: 20,
  },
  cardSection: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 20,
    width: '100%',
  },
  card: {
    padding: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#3281FF',
    borderWidth: 2,
    backgroundColor: '#F0F6FF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 6,
    color: '#64748B',
    textAlign: 'center',
  },
  cardDisabled: {
    backgroundColor: '#eee',
    borderColor: '#ddd',
  },
  disabledText: {
    color: '#aaa',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  Button: {
    width: '90%',
    marginBottom: 30,
    height: 60,
  },
})
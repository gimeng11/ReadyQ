import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
    alignItems: 'center',
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
  inputSection: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 20,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,      // 👈 둥근 모서리
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#F8F9FB',
    color: '#333',
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
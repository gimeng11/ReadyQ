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
		lineHeight: 22,
  },
	buttonSection: {
		width: '100%',
  	alignItems: 'center',
		marginTop: 30,
	},
  Button: {
    width: '90%',
    marginBottom: 15,
    height: 60,
  },
})
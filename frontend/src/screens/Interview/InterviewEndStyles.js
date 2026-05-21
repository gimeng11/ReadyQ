import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TextSection: {
    width: '90%',
    alignItems: 'center',
  },
  label1: {
    fontSize: 20,
    marginBottom: 15,
  },
  label2: {
    fontSize: 14,
    marginBottom: 20,
    color: '#64748B',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  buttonLeft: {
    flex: 1,
    marginRight: 8,
  },
  buttonRight: {
    flex: 1,
    marginLeft: 8,
  },
})
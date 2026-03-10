import { StyleSheet } from 'react-native'
import Header from '../../components/Header'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 52,
  },
  
  scrollContainer: {
    paddingBottom: 120,
    alignItems: 'center',
  },

  inner: {
    width: '85%',
  },

  label: {
    fontSize: 18,
    marginBottom: 6,
    color: '#64748B',
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 30,
    fontSize: 17,
    fontFamily: 'PretendardRegular',
  },

  phoneRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  phoneInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    fontSize: 17,
    fontFamily: 'PretendardRegular',
  },

  verifyButton: {
    width: 80,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    marginTop: 30,
  },

  bottomSection: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  companyText: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 6,
  },

  companyLink: {
    fontSize: 13,
    color: '#3B82F6',
  },
})
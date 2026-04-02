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
  width: '85%',
},

bottomSection: {
  flexDirection: 'row',
  alignItems: 'center',
},

  title: {
    fontSize: 24,
    marginBottom: 32,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16, 
    fontFamily: 'PretendardRegular',
    backgroundColor: '#FFFFFF', 
  },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#64748B',
  },

  linkText: {
    fontSize: 13,
    color: '#6B7280',
  },

  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },

  snsDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  snsText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
  },

  companyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 200,
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

inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',  
    gap: 8,
    marginBottom: 16,       
    height: 52,             
  },
verifyButtonSmall: {
    width: 80,
    height: 52,             
    marginTop: 0,          
    paddingVertical: 0,     
    justifyContent: 'center',
  },
})
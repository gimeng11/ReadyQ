import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  underline: {
    marginTop: 8,
    height: 2,
    width: '100%',
    backgroundColor: '#64748B',
  },
  contentContainer: {
    width: '100%',
  },
  scoreContainer: {
    alignItems: 'left',
  },
  scoreTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  AIscore: {
    fontSize: 32,
    color: '#000',
  },
  totalscore: {
    fontSize: 24,
    color: '#64748B',
  },
  compareBox: {
    marginTop: 16,
    marginBottom: 16,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compareLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  compareValue: {
    fontSize: 14,
    color: '#3281FF', // 파란색
    fontWeight: 'bold',
  },
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  historyText: {
    fontSize: 16,
    color: '#64748B'
  },
  arrowIcon: {
    tintColor: '#999', 
  },
  divider: {
    width: '100%',
    height: 15, // 두께 (원하는 만큼 조절)
    backgroundColor: '#f0f0f0',
  },
  analysisContainer: {
    marginTop: 25,
  },
  analysisTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  competencyContainer:{
    marginTop: 25,
  },
  competencyTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  competencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#3281FF',
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
    marginBottom: 5,
    tintColor: '#64748B',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    color: '#000',
  },
  gradeBox: {
    marginTop: 4,
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 12,
    color: '#3281FF',
  },
})
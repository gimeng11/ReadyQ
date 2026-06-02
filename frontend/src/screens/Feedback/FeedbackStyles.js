import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
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
    width:24, 
    height: 24,
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
  onePointCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3281FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  onePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  onePointLabel: {
    fontSize: 13,
    color: '#3281FF',
    marginRight: 6,
  },
  onePointTitle: {
    fontSize: 16,
    color: '#111',
  },
  onePointScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  onePointCompName: {
    fontSize: 15,
    color: '#222',
  },
  onePointScoreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onePointScore: {
    fontSize: 15,
  },
  onePointBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  onePointBadgeText: {
    fontSize: 12,
  },
  onePointDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  onePointMessage: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  videoTabContainer: {
    padding: 20,
  },
  videoTabButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F1F3F5',
    marginRight: 10,
  },
  activeVideoTabButton: {
    backgroundColor: '#3281FF',
  },
  videoTabText: {
    fontSize: 13,
    color: '#666',
  },
  activeVideoTabText: {
    color: '#fff',
  },
  videoContentContainer: {
    flexGrow: 1,
  },
  videoBox: {
    width: '70%',
    aspectRatio: 9 / 16,
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 40,
  },
  
  //영상 연결 후 삭제 예정
  videoPlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  /*
  영상 연결되면 사용 
  video: {
    width: '100%',
    height: '100%',
  },
  */
  questionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#111',
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  questionNumber: {
    fontSize: 15,
    color: '#3281FF',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    lineHeight: 22,
  },
  questionArrow: {
    width: 14,
    height: 14,
    tintColor: '#9EACBF',
  },
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  detailQuestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailQuestionNumber: {
    fontSize: 15,
    color: '#3281FF',
    marginRight: 12,
  },
  detailQuestionText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    lineHeight: 24,
  },
  transcriptContainer: {
  },
  transcriptTitle: {
    fontSize: 15,
    color: '#3281FF',
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 15,
    color: '#222',
    lineHeight: 24,
  },
})
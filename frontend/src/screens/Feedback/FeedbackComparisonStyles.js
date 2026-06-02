import { StyleSheet } from 'react-native'
import CustomButton from '../../components/CustomButton'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F1F3F5',
    marginRight: 10,
  },

  activeTabButton: {
    backgroundColor: '#3281FF',
  },

  tabText: {
    fontSize: 13,
    color: '#666',
  },

  activeTabText: {
    color: '#fff',
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  scoreContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth:1,
    borderBottomColor: '#eee',
  },
  scoreTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  AIscore: {
    fontSize: 34,
    color: '#111',
  },
  totalscore: {
    fontSize: 22,
    color: '#64748B',
  },
  compareBox: {
    paddingTop: 10,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compareLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  compareValue: {
    fontSize: 14,
    color: '#3281FF',
  },
  graphContainer: {
    paddingTop: 28,
  },
  graphTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  radarChartBox: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 6,
  },

  legendText: {
    fontSize: 13,
    color: '#64748B',
  },
})
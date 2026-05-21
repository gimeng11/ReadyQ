import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#E6F0FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#3281FF',
  },
  topTextBox: {
    flex: 1,
  },
  competencyTitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 22,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  descCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  periodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 14,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  periodLabel: {
    fontSize: 14,
    color: '#64748B',
    width: 42,
  },
  periodBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  periodBarFill: {
    height: 8,
    borderRadius: 4,
  },
  periodScore: {
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
})

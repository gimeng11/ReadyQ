import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 100,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },

  titleText: {
    width: '100%',
    fontSize: 18,
    color: '#111',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D9E1EB',
    marginTop: 12,
    marginBottom: 20,
  },

  // 카드
  graphCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,

    // ios shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    // android shadow
    elevation: 2,
  },

  // 상단
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  graphTitle: {
    fontSize: 17,
    color: '#111',
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  graphScore: {
    fontSize: 16,
    marginRight: 10,
  },

  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gradeText: {
    fontSize: 12,
  },

  // 그래프
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 20,
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  // 피드백
  feedbackSection: {
    marginTop: 22,
  },

  feedbackTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#111',
  },

  feedbackText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#666',
  },
})
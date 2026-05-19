import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  completeIcon: {
    width: 60,
    height: 60,
    tintColor: '#3281FF',
    resizeMode: 'contain',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
  },
  progressWrapper: {
    position: 'absolute',
    top: 110,
    left: 30,
    right: 30,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3281FF',
    borderRadius: 999,
  },
  progressText: {
    marginTop: 10,
    fontSize: 15,
    letterSpacing: 2,
    color: '#000000',
  },
})
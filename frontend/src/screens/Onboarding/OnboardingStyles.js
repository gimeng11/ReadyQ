import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 36,
  },

  topSection: {
    alignItems: 'center',
  },

  textContainer: {
    minHeight: 150,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
    color: '#111',
  },

  highlightText: {
    color: '#3281FF',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#9EACBF',
  },

  imageRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: 260,
    height: 400,
    borderRadius: 24,
  },

  logoImage: {
    width: 180,
    height: 180,
  },

  arrowOverlay: {
    position: 'absolute',
    top: 390, 
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },

  arrowSide: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowIcon: {
    width: 40,
    height: 40,
    tintColor: '#9EACBF',
  },

  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 60,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#9EACBF',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 16,
    backgroundColor: '#3281FF',
  },

  buttonContainer: {
    width: '85%',
    alignSelf: 'center',
  },
})
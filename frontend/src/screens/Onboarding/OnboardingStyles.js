import { StyleSheet, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    minHeight: 150,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    marginBottom: 40,
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
    height: height * 0.42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.55,
    height: width * 1,
  },
  logoImage: {
    width: width * 0.45,
    height: width * 0.40,
    marginBottom: 25,
  },
  arrowOverlay: {
    position: 'absolute',
    top: height * 0.50,
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
    marginBottom: 40,
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
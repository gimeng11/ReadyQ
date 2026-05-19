import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,

  },

  leftSection: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 10,
  },

  backButton: {
    padding: 10,
  },

  homeButton: {
    marginLeft: 8,
  },

  arrow: {
    width: 20,
    height: 20,
  },

  title: {
    fontSize: 16,
  },
})
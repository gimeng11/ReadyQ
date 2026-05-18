import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },

  title: {
    fontSize: 20,
    textAlign: 'left',
    marginBottom: 20,
  },

  buttonContainer: {
    flex: 1,
    width: '100%',
  },

  button: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: '#E6F1FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  buttonText: {
    fontSize: 15,
    color: '#3281FF',
    fontWeight: '600',
    textAlign: 'center',
  },
})
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 40, 
    paddingHorizontal: 20,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    paddingTop: 80, 
  },

  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20, 
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },

  startButtonWrapper: {
    width: '75%',
    alignSelf: 'center',
    marginBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },

  cardTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },

  cardDesc: {
    color: '#666',
    fontSize: 13,
  },
});

export default styles;
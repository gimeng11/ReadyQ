import { View, Image } from 'react-native'
import { styles } from './StartStyles'
import CustomButton from '../../components/CustomButton'

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/icons/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          title="개인 회원"
          type="primary"
          onPress={() => navigation.navigate('Login')}
        />

        <CustomButton
          title="기업 회원"
          type="secondary"
          onPress={() => console.log('기업 회원')}
        />
      </View>
    </View>
  )
}
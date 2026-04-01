import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import StartScreen from './src/screens/StartScreen/StartScreen'
import LoginScreen from './src/screens/LoginScreen/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen/SignUpScreen'
import FindIdScreen from './src/screens/FindIdScreen/FindIdScreen'
import FindPwScreen from './src/screens/FindPwScreen/FindPwScreen'
import NewPwScreen from './src/screens/FindPwScreen/NewPwScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const [fontsLoaded] = useFonts({
    PretendardRegular: require('./assets/fonts/Pretendard-Regular.ttf'),
    PretendardMedium: require('./assets/fonts/Pretendard-Medium.ttf'),
    PretendardBold: require('./assets/fonts/Pretendard-Bold.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="FindId" component={FindIdScreen} />
        <Stack.Screen name="FindPw" component={FindPwScreen} />
        <Stack.Screen name="NewPw" component={NewPwScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
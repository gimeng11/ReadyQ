import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import StartScreen from './src/screens/StartScreen/StartScreen'
import LoginScreen from './src/screens/LoginScreen/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen/SignUpScreen'
import SignUpJobScreen from './src/screens/SignUpScreen/SignUpJobScreen'
import SignUpCareerScreen from './src/screens/SignUpScreen/SignUpCareerScreen'
import FindIdScreen from './src/screens/FindIdScreen/FindIdScreen'
import FindPwScreen from './src/screens/FindPwScreen/FindPwScreen'
import NewPwScreen from './src/screens/FindPwScreen/NewPwScreen'
import HomeScreen from './src/screens/Home/HomeScreen'
import InterviewScreen from './src/screens/Interview/InterviewScreen'
import MockInterviewScreen from './src/screens/MockInterview/MockInterviewScreen'
import ResumeScreen from './src/screens/Resume/ResumeScreen'
import ArchiveScreen from './src/screens/Archive/ArchiveScreen'
import CommunityScreen from './src/screens/Community/CommunityScreen'
import ProfileScreen from './src/screens/Profile/ProfileScreen'
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen'

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
        <Stack.Screen name="SignUpJob" component={SignUpJobScreen} />
        <Stack.Screen name="SignUpCareer" component={SignUpCareerScreen} />
        <Stack.Screen name="FindId" component={FindIdScreen} />
        <Stack.Screen name="FindPw" component={FindPwScreen} />
        <Stack.Screen name="NewPw" component={NewPwScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Interview" component={InterviewScreen} />
        <Stack.Screen name="MockInterview" component={MockInterviewScreen} />
        <Stack.Screen name="Resume" component={ResumeScreen} />
        <Stack.Screen name="Archive" component={ArchiveScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
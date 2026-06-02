import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PostProvider } from './src/context/PostContext';
import { UserProvider } from './src/context/UserContext';

import StartScreen from './src/screens/StartScreen/StartScreen'
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'
import LoginScreen from './src/screens/LoginScreen/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen/SignUpScreen'
import SignUpJobScreen from './src/screens/SignUpScreen/SignUpJobScreen'
import SignUpCareerScreen from './src/screens/SignUpScreen/SignUpCareerScreen'
import FindIdScreen from './src/screens/FindIdScreen/FindIdScreen'
import FindPwScreen from './src/screens/FindPwScreen/FindPwScreen'
import NewPwScreen from './src/screens/FindPwScreen/NewPwScreen'
import HomeScreen from './src/screens/Home/HomeScreen'
import InterviewScreen from './src/screens/Interview/InterviewScreen'
import InterviewTitle from './src/screens/Interview/InterviewTitle'
import QuestionType from './src/screens/Interview/QuestionType'
import InterviewCamera from './src/screens/Interview/InterviewCamera'
import InterviewEnd from './src/screens/Interview/InterviewEnd'
import MockInterviewScreen from './src/screens/MockInterview/MockInterviewScreen'
import ResumeScreen from './src/screens/Resume/ResumeScreen'
import ArchiveScreen from './src/screens/Archive/ArchiveScreen'
import CommunityScreen from './src/screens/Community/CommunityScreen'
import ProfileScreen from './src/screens/Profile/ProfileScreen'
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen'
import PostSelectScreen from './src/screens/Community/PostSelectScreen'
import PostWriteScreen from './src/screens/Community/PostWriteScreen'
import PostDetailScreen from './src/screens/Community/PostDetailScreen'
import ScrapScreen from './src/screens/Community/ScrapScreen'
import FeedbackScreen from './src/screens/Feedback/FeedbackScreen'
import FeedbackDetail from './src/screens/Feedback/FeedbackDetail'

import FeedbackComparison from './src/screens/Feedback/FeedbackComparison'
import PostListScreen from './src/screens/Community/PostListScreen'
import ProfileEditScreen from './src/screens/Profile/ProfileEditScreen'
import CoverLetterArchiveScreen from './src/screens/CoverLetter/CoverLetterArchiveScreen'
import CoverLetterDetailScreen from './src/screens/CoverLetter/CoverLetterDetailScreen'


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

  return ( <UserProvider>
    <PostProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignUpJob" component={SignUpJobScreen} />
        <Stack.Screen name="SignUpCareer" component={SignUpCareerScreen} />
        <Stack.Screen name="FindId" component={FindIdScreen} />
        <Stack.Screen name="FindPw" component={FindPwScreen} />
        <Stack.Screen name="NewPw" component={NewPwScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Interview" component={InterviewScreen} />
        <Stack.Screen name="InterviewTitle" component={InterviewTitle} />
        <Stack.Screen name="QuestionType" component={QuestionType} />
        <Stack.Screen name="InterviewCamera" component={InterviewCamera} />
        <Stack.Screen name="InterviewEnd" component={InterviewEnd} />
        <Stack.Screen name="MockInterview" component={MockInterviewScreen} />
        <Stack.Screen name="Resume" component={ResumeScreen} />
        <Stack.Screen name="Archive" component={ArchiveScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="PostSelect" component={PostSelectScreen} />
        <Stack.Screen name="PostWrite" component={PostWriteScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Scrap" component={ScrapScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="FeedbackDetail" component={FeedbackDetail} />

        <Stack.Screen name="FeedbackComparison" component={FeedbackComparison} />
        <Stack.Screen name="PostList" component={PostListScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="CoverLetterArchive" component={CoverLetterArchiveScreen} />
        <Stack.Screen name="CoverLetterDetail" component={CoverLetterDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </PostProvider>
  </UserProvider>
  )
}
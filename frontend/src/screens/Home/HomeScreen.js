import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './HomeStyles';
import BottomTab from '../../components/BottomTab';
import CustomButton from '../../components/CustomButton';
import { useUser } from '../../context/UserContext';

export default function HomeScreen({ navigation }) {
  const { userInfo } = useUser();

  return (
    <View style={styles.container}>
        
        <View style={styles.header}>
  </View>
      <View style={styles.content}>
        <Image
                source={require('../../../assets/icons/Logo.png')}
                style={styles.logo}
              />
        <Text style={styles.title}>
          {userInfo.nickname}님, 안녕하세요{"\n"}
          지금부터 AI 면접을 시작할까요?
        </Text>

        <Text style={styles.subtitle}>
          AI가 질문부터 피드백까지 도와줘요.
        </Text>

        <CustomButton
            title="시작하기"
            onPress={() => navigation.navigate('Interview')}
            type="primary"
            style={styles.startButtonWrapper}
        />

        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MockInterview')}
        >
        <Text style={styles.cardTitle}>함께 모의 면접하기</Text>
        <Text style={styles.cardDesc}>
            사용자와 1:1 또는 그룹으로 면접 연습을 할 수 있어요.
        </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Resume')}
        >
        <Text style={styles.cardTitle}>자소서 첨삭하기</Text>
        <Text style={styles.cardDesc}>
            AI와 함께 자소서를 첨삭하고 다듬을 수 있어요.
        </Text>
    </TouchableOpacity>

      </View>

      <BottomTab navigation={navigation} routeName="Home" />

    </View>
  );
}
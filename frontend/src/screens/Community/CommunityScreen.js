import { View, Text } from 'react-native';
import BottomTab from '../../components/BottomTab';

export default function CommunityScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Community Screen</Text>
      </View>

      <BottomTab navigation={navigation} routeName="Community" />
      
    </View>
  );
}
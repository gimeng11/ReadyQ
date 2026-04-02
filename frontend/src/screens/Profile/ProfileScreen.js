import { View, Text } from 'react-native';
import BottomTab from '../../components/BottomTab';

export default function ProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Profile Screen</Text>
      </View>

      <BottomTab navigation={navigation} routeName="Profile" />
      
    </View>
  );
}
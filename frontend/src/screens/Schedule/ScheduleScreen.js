import { View, Text } from 'react-native';
import BottomTab from '../../components/BottomTab';

export default function ScheduleScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Schedule Screen</Text>
      </View>

      <BottomTab navigation={navigation} routeName="Schedule" />
      
    </View>
  );
}
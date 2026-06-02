import { View, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native'
import { useState } from 'react'
import { styles } from './ArchiveStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'

export default function ArchiveScreen({ navigation }) {

  const [archiveList] = useState([
    {
      id: 1,
      title: '면접 제목 1',
      date: '05.01',
    },
    {
      id: 2,
      title: '면접 제목 2',
      date: '05.10',
    },
  ])

  return (
    <View style={styles.container}>

      <Header
        title='면접 아카이브'
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={styles.cardSection}
      >
        {archiveList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('Feedback', {
                sessionId: item.id,
                title: item.title,
                date: item.date,
                from: 'Archive',
              })
            }
          >

            <CustomText weight="bold" style={styles.cardTitle}>
              {item.title}
            </CustomText>

            <CustomText style={styles.cardDesc}>
              {item.date}
            </CustomText>

          </TouchableOpacity>
        ))}

      </ScrollView>

    </View>
  )
}
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { styles } from './ArchiveStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import { getInterviewHistory } from '../../api/interview'

const formatDate = (dateVal) => {
  if (!dateVal) return '-'
  let d
  if (Array.isArray(dateVal)) {
    // LocalDateTime as array [year, month, day, ...]
    d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2])
  } else {
    d = new Date(dateVal)
  }
  if (isNaN(d.getTime())) return '-'
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

export default function ArchiveScreen({ navigation }) {
  const [archiveList, setArchiveList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInterviewHistory()
      .then(sessions => {
        const list = sessions
          .filter(s => s.status === 'COMPLETED')
          .map(s => ({
            id: s.id,
            title: s.title || '제목 없음',
            date: formatDate(s.completedAt || s.createdAt),
          }))
        setArchiveList(list)
      })
      .catch(e => console.error('아카이브 조회 실패:', e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>

      <Header
        title='면접 아카이브'
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.cardSection}
        >
          {archiveList.length === 0 ? (
            <CustomText style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>
              완료된 면접이 없어요.
            </CustomText>
          ) : (
            archiveList.map((item) => (
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
            ))
          )}
        </ScrollView>
      )}

    </View>
  )
}

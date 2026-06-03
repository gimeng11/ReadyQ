import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { styles } from './ArchiveStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import BottomTab from '../../components/BottomTab'
import { getInterviewHistory, deleteInterview, togglePinInterview } from '../../api/interview'

const formatDate = (dateVal) => {
  if (!dateVal) return '-'
  let d
  if (Array.isArray(dateVal)) {
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

  const loadHistory = useCallback(() => {
    setLoading(true)
    getInterviewHistory()
      .then(sessions => {
        const list = sessions
          .filter(s => s.status === 'COMPLETED')
          .map(s => ({
            id: s.id,
            title: s.title || '제목 없음',
            date: formatDate(s.completedAt || s.createdAt),
            pinned: s.pinned ?? false,
          }))
        setArchiveList(list)
      })
      .catch(e => console.error('아카이브 조회 실패:', e))
      .finally(() => setLoading(false))
  }, [])

  useFocusEffect(loadHistory)

  const handleDelete = (item) => {
    Alert.alert(
      '면접 삭제',
      `'${item.title}' 면접 기록을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInterview(item.id)
              setArchiveList(prev => prev.filter(a => a.id !== item.id))
            } catch (e) {
              Alert.alert('오류', '삭제에 실패했어요.')
            }
          },
        },
      ]
    )
  }

  const handleTogglePin = async (item) => {
    try {
      const res = await togglePinInterview(item.id)
      const newPinned = res?.pinned ?? !item.pinned
      setArchiveList(prev => {
        const updated = prev.map(a =>
          a.id === item.id ? { ...a, pinned: newPinned } : a
        )
        return [
          ...updated.filter(a => a.pinned),
          ...updated.filter(a => !a.pinned),
        ]
      })
    } catch (e) {
      Alert.alert('오류', '고정 변경에 실패했어요.')
    }
  }

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
                style={[styles.card, item.pinned && styles.cardPinned]}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate('Feedback', {
                    sessionId: item.id,
                    title: item.title,
                    date: item.date,
                    from: 'Archive',
                  })
                }
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardInfo}>
                    {item.pinned && (
                      <CustomText style={styles.pinnedBadge}>고정됨</CustomText>
                    )}
                    <CustomText weight="bold" style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </CustomText>
                    <CustomText style={styles.cardDesc}>{item.date}</CustomText>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleTogglePin(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CustomText style={[styles.actionText, item.pinned && styles.actionTextActive]}>
                        고정
                      </CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CustomText style={styles.actionText}>삭제</CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <BottomTab navigation={navigation} routeName="Archive" />
    </View>
  )
}

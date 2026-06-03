import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { styles } from './CoverLetterArchiveStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import { getCoverLetterHistory, deleteCoverLetter, togglePinCoverLetter, renameCoverLetter } from '../../api/coverLetter'

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

const getScoreColor = (score) => {
  if (score >= 85) return '#3281FF'
  if (score >= 70) return '#22C55E'
  if (score >= 55) return '#ff8630'
  return '#EF4444'
}

export default function CoverLetterArchiveScreen({ navigation }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const loadHistory = useCallback(() => {
    setLoading(true)
    getCoverLetterHistory()
      .then(data => setList(data || []))
      .catch(e => console.error('자소서 기록 조회 실패:', e))
      .finally(() => setLoading(false))
  }, [])

  useFocusEffect(loadHistory)

  const handleEdit = (item) => {
    setEditItem(item)
    setEditTitle(item.title)
    setEditModalVisible(true)
  }

  const handleEditSave = async () => {
    const trimmed = editTitle.trim()
    if (!trimmed) return
    try {
      await renameCoverLetter(editItem.id, trimmed)
      setList(prev => prev.map(r =>
        r.id === editItem.id ? { ...r, title: trimmed } : r
      ))
      setEditModalVisible(false)
    } catch (e) {
      Alert.alert('오류', '제목 수정에 실패했어요.')
    }
  }

  const handleDelete = (item) => {
    Alert.alert(
      '삭제',
      `'${item.title}' 기록을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCoverLetter(item.id)
              setList(prev => prev.filter(r => r.id !== item.id))
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
      const res = await togglePinCoverLetter(item.id)
      const newPinned = res?.pinned ?? !item.pinned
      setList(prev => {
        const updated = prev.map(r =>
          r.id === item.id ? { ...r, pinned: newPinned } : r
        )
        return [
          ...updated.filter(r => r.pinned),
          ...updated.filter(r => !r.pinned),
        ]
      })
    } catch (e) {
      Alert.alert('오류', '고정 변경에 실패했어요.')
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title="자소서 첨삭 기록"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3281FF" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.cardSection}
        >
          {list.length === 0 ? (
            <CustomText style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>
              저장된 자소서 첨삭이 없어요.
            </CustomText>
          ) : (
            list.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, item.pinned && styles.cardPinned]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('CoverLetterDetail', { record: item })}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardInfo}>
                    {item.pinned && (
                      <CustomText style={styles.pinnedBadge}>고정됨</CustomText>
                    )}
                    <CustomText weight="bold" style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </CustomText>
                    <View style={styles.cardMeta}>
                      <CustomText style={styles.cardDesc}>
                        {formatDate(item.createdAt)}
                      </CustomText>
                      <CustomText
                        weight="bold"
                        style={[styles.cardScore, { color: getScoreColor(item.overallScore) }]}
                      >
                        {item.overallScore}점
                      </CustomText>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEdit(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CustomText style={styles.actionText}>수정</CustomText>
                    </TouchableOpacity>

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
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <CustomText weight="bold" style={styles.modalTitle}>제목 수정</CustomText>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              autoFocus
              maxLength={50}
              placeholder="새 제목을 입력하세요"
              placeholderTextColor="#bbb"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <CustomText style={styles.modalBtnText}>취소</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleEditSave}
              >
                <CustomText style={[styles.modalBtnText, styles.modalBtnTextSave]}>저장</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

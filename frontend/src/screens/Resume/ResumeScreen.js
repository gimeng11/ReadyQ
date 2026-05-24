import {
  View, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useState } from 'react'
import { styles } from './ResumeStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'
import { reviewCoverLetter } from '../../api/coverLetter'

const MAX_CHARS = 3000

export default function ResumeScreen({ navigation }) {
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState('ai')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleReview = async () => {
    if (text.trim().length < 50) {
      Alert.alert('알림', '자소서를 50자 이상 입력해 주세요.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await reviewCoverLetter(text.trim())
      setResult(data)
      setActiveTab('ai')
    } catch (e) {
      Alert.alert('오류', '분석에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#3281FF'
    if (score >= 70) return '#22C55E'
    if (score >= 55) return '#ff8630'
    return '#EF4444'
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header
          title="자소서 첨삭"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 입력 영역 */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <CustomText weight="bold" style={styles.inputLabel}>자기소개서</CustomText>
              <CustomText style={styles.charCount}>
                {text.length} / {MAX_CHARS}
              </CustomText>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              value={text}
              onChangeText={t => setText(t.slice(0, MAX_CHARS))}
              placeholder="자소서를 여기에 붙여넣으세요."
              placeholderTextColor="#b0b8c1"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.reviewButton, loading && styles.reviewButtonDisabled]}
            onPress={handleReview}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CustomText weight="bold" style={styles.reviewButtonText}>
                AI 첨삭 받기
              </CustomText>
            )}
          </TouchableOpacity>

          {loading && (
            <CustomText style={styles.loadingHint}>
              Gemini가 분석 중이에요. 30초~1분 정도 소요돼요.
            </CustomText>
          )}

          {/* 결과 영역 */}
          {result && (
            <View style={styles.resultContainer}>
              {/* 점수 카드 */}
              <View style={styles.scoreCard}>
                <CustomText weight="bold" style={styles.scoreLabel}>전체 점수</CustomText>
                <CustomText
                  weight="bold"
                  style={[styles.scoreValue, { color: getScoreColor(result.overallScore) }]}
                >
                  {result.overallScore}점
                </CustomText>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.overallScore}%`,
                        backgroundColor: getScoreColor(result.overallScore),
                      },
                    ]}
                  />
                </View>
                <CustomText style={styles.overallComment}>{result.overallComment}</CustomText>
              </View>

              {/* 탭 */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
                  onPress={() => setActiveTab('ai')}
                >
                  <CustomText
                    weight="bold"
                    style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}
                  >
                    AI 첨삭
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'spell' && styles.tabActive]}
                  onPress={() => setActiveTab('spell')}
                >
                  <CustomText
                    weight="bold"
                    style={[styles.tabText, activeTab === 'spell' && styles.tabTextActive]}
                  >
                    맞춤법 ({result.spellerErrors?.length ?? 0})
                  </CustomText>
                </TouchableOpacity>
              </View>

              {/* AI 첨삭 탭 */}
              {activeTab === 'ai' && (
                <View>
                  {/* 강점 */}
                  {result.strengths?.length > 0 && (
                    <View style={styles.section}>
                      <CustomText weight="bold" style={styles.sectionTitle}>✅ 잘된 점</CustomText>
                      {result.strengths.map((s, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <CustomText style={styles.bullet}>•</CustomText>
                          <CustomText style={styles.bulletText}>{s}</CustomText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 개선점 */}
                  {result.improvements?.length > 0 && (
                    <View style={styles.section}>
                      <CustomText weight="bold" style={styles.sectionTitle}>✏️ 개선 제안</CustomText>
                      {result.improvements.map((item, i) => (
                        <View key={i} style={styles.improvementCard}>
                          <View style={styles.quoteBox}>
                            <CustomText style={styles.quoteText}>"{item.quote}"</CustomText>
                          </View>
                          <View style={styles.arrowRow}>
                            <CustomText style={styles.arrow}>↓</CustomText>
                          </View>
                          <View style={styles.suggestionBox}>
                            <CustomText weight="medium" style={styles.suggestionText}>
                              {item.suggestion}
                            </CustomText>
                          </View>
                          {!!item.reason && (
                            <CustomText style={styles.reasonText}>💡 {item.reason}</CustomText>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* 맞춤법 탭 */}
              {activeTab === 'spell' && (
                <View style={styles.section}>
                  {/* API 호출 자체 실패 */}
                  {result.spellerChecked && !result.spellerAvailable && (
                    <View style={styles.emptySpell}>
                      <CustomText style={styles.emptySpellText}>
                        맞춤법 검사 서비스를 일시적으로 사용할 수 없어요.
                      </CustomText>
                    </View>
                  )}

                  {/* API 성공, 오류 없음 */}
                  {result.spellerAvailable && result.spellerErrors?.length === 0 && (
                    <View style={styles.emptySpell}>
                      <CustomText style={styles.emptySpellText}>
                        맞춤법 오류가 없어요! 🎉
                      </CustomText>
                    </View>
                  )}

                  {/* API 성공, 오류 있음 */}
                  {result.spellerAvailable && result.spellerErrors?.length > 0 &&
                    result.spellerErrors.map((err, i) => (
                      <View key={i} style={styles.spellerCard}>
                        <View style={styles.spellerRow}>
                          <CustomText style={styles.spellerToken}>{err.token}</CustomText>
                          <CustomText style={styles.spellerArrow}>→</CustomText>
                          <CustomText weight="bold" style={styles.spellerSuggestion}>
                            {err.suggestion}
                          </CustomText>
                        </View>
                        {!!err.help && (
                          <CustomText style={styles.spellerHelp}>{err.help}</CustomText>
                        )}
                      </View>
                    ))
                  }
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

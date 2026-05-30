import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { styles } from './CoverLetterDetailStyles'
import CustomText from '../../components/CustomText'
import Header from '../../components/Header'

const getScoreColor = (score) => {
  if (score >= 85) return '#3281FF'
  if (score >= 70) return '#22C55E'
  if (score >= 55) return '#ff8630'
  return '#EF4444'
}

export default function CoverLetterDetailScreen({ navigation, route }) {
  const { record } = route.params
  const [activeTab, setActiveTab] = useState('ai')

  return (
    <View style={styles.container}>
      <Header
        title="자소서 첨삭 결과"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 원본 자소서 */}
        {!!record.text && (
          <View style={styles.originalCard}>
            <CustomText weight="bold" style={styles.originalLabel}>내가 쓴 자소서</CustomText>
            <CustomText style={styles.originalText}>{record.text}</CustomText>
          </View>
        )}

        {/* 점수 카드 */}
        <View style={styles.scoreCard}>
          <CustomText weight="bold" style={styles.scoreLabel}>전체 점수</CustomText>
          <CustomText
            weight="bold"
            style={[styles.scoreValue, { color: getScoreColor(record.overallScore) }]}
          >
            {record.overallScore}점
          </CustomText>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${record.overallScore}%`,
                  backgroundColor: getScoreColor(record.overallScore),
                },
              ]}
            />
          </View>
          <CustomText style={styles.overallComment}>{record.overallComment}</CustomText>
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
              맞춤법 ({record.spellerErrors?.length ?? 0})
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* AI 첨삭 탭 */}
        {activeTab === 'ai' && (
          <View>
            {record.strengths?.length > 0 && (
              <View style={styles.section}>
                <CustomText weight="bold" style={styles.sectionTitle}>✅ 잘된 점</CustomText>
                {record.strengths.map((s, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <CustomText style={styles.bullet}>•</CustomText>
                    <CustomText style={styles.bulletText}>{s}</CustomText>
                  </View>
                ))}
              </View>
            )}

            {record.improvements?.length > 0 && (
              <View style={styles.section}>
                <CustomText weight="bold" style={styles.sectionTitle}>✏️ 개선 제안</CustomText>
                {record.improvements.map((item, i) => (
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
            {record.spellerChecked && !record.spellerAvailable && (
              <View style={styles.emptySpell}>
                <CustomText style={styles.emptySpellText}>
                  맞춤법 검사 서비스를 일시적으로 사용할 수 없어요.
                </CustomText>
              </View>
            )}

            {record.spellerAvailable && record.spellerErrors?.length === 0 && (
              <View style={styles.emptySpell}>
                <CustomText style={styles.emptySpellText}>
                  맞춤법 오류가 없어요! 🎉
                </CustomText>
              </View>
            )}

            {record.spellerAvailable && record.spellerErrors?.length > 0 &&
              record.spellerErrors.map((err, i) => (
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
      </ScrollView>
    </View>
  )
}

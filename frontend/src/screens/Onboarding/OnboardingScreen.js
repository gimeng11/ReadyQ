import React, { useState, useRef } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native'

import { styles } from './OnboardingStyles'

import CustomButton from '../../components/CustomButton'
import CustomText from '../../components/CustomText'

export default function OnboardingScreen({ navigation }) {
  const { width } = Dimensions.get('window')

  const flatListRef = useRef(null)

  const [currentPage, setCurrentPage] = useState(0)

  const onboardingData = [
    {
      id: 1,
      image: require('../../../assets/icons/mockup1.png'),

      title: ['AI와 함께\n', '면접 연습', '을 ', '시작', '해보세요'],
      titleHighlight: [1, 3],

      description: [],
    },

    {
      id: 2,
      image: require('../../../assets/icons/mockup2.gif'),

      title: ['면접 환경을 설정', '하고,'],
      titleHighlight: [0],

      description: ['분위기 설정 → 면접 제목 → 질문 유형'],
    },

    {
      id: 3,
      image: require('../../../assets/icons/mockup3.png'),

      title: ['실제 면접처럼 연습', '해보세요.'],
      titleHighlight: [0],

      description: [
        '면접은 최대 5교시, 질문당 답변 시간은 90초예요.\n',
        '원하는 만큼 진행하고, 중간에 종료할 수도 있어요.\n',
        '(교시가 늘어날수록 피드백 결과가 더 정확해져요.)',
      ],
    },

    {
      id: 4,
      image: require('../../../assets/icons/mockup4.gif'),

      title: [
        '면접이 끝나면\n',
        '답변 분석',
        ' 후 ',
        '피드백',
        '이 제공돼요.',
      ],
      titleHighlight: [1, 3],

      description: [
        '면접 영상과 피드백은 저장되어\n',
        '아카이브에서 다시 볼 수 있어요.',
      ],
    },

    {
      id: 5,
      image: require('../../../assets/icons/Logo.png'),

      title: [
        '면접 결과',
        '와 ',
        '변화를 기록',
        '하며\n',
        '꾸준히 ',
        '실력을 쌓아보세요!',
      ],
      titleHighlight: [0, 2, 5],

      description: [],
    },
  ]

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      })
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentPage - 1,
        animated: true,
      })
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onMomentumScrollEnd={(event) => {
          const page = Math.round(
            event.nativeEvent.contentOffset.x / width
          )
          setCurrentPage(page)
        }}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              alignItems: 'center',
            }}
          >
            <View style={styles.topSection}>
              <View style={styles.textContainer}>
                <CustomText style={styles.title}>
                  {item.title.map((text, index) => (
                    <CustomText
                      key={index}
                      weight={
                        item.titleHighlight?.includes(index)
                          ? 'bold'
                          : 'medium'
                      }
                      style={[
                        styles.title,
                        item.titleHighlight?.includes(index) &&
                          styles.highlightText,
                      ]}
                    >
                      {text}
                    </CustomText>
                  ))}
                </CustomText>

                {item.description.length > 0 && (
                  <CustomText style={styles.description}>
                    {item.description.map((text, index) => (
                      <CustomText
                        key={index}
                        style={styles.description}
                      >
                        {text}
                      </CustomText>
                    ))}
                  </CustomText>
                )}
              </View>

              <View style={styles.imageRow}>
                <View style={styles.imageContainer}>
                  <Image
                    source={item.image}
                    style={[
                      styles.image,
                      item.id === 5 && styles.logoImage,
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.arrowOverlay}>
        <View style={styles.arrowSide}>
          {currentPage > 0 && (
            <TouchableOpacity onPress={handlePrev}>
              <Image
                source={require('../../../assets/icons/arrow.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.arrowSide}>
          {currentPage < onboardingData.length - 1 && (
            <TouchableOpacity onPress={handleNext}>
              <Image
                source={require('../../../assets/icons/arrow2.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 인디케이터 */}
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="바로 시작하기"
          type="primary"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </View>
  )
}
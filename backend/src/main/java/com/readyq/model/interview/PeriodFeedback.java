package com.readyq.model.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodFeedback {

    // 평가 항목별 점수 (logicStructure, speechSpeed, voiceVolume, eyeContact, fillerWords, answerClarity)
    private Map<String, Integer> scores;

    private int overallScore;

    private String summaryFeedback;

    // 항목별 상세 피드백
    private Map<String, String> detailFeedback;

    private List<String> improvementTips;
}

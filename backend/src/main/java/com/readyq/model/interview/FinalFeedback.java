package com.readyq.model.interview;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class FinalFeedback {

    private int totalScore;

    private List<Integer> periodScores;

    private String comparisonWithPrev;

    private List<String> strongPoints;

    private List<String> weakPoints;

    private List<String> improvementPoints;

    private String overallSummary;

    // 역량별 짧은 설명 (logicStructure, speechSpeed, etc.)
    private Map<String, String> competencyShortDescriptions;

    // 역량별 평균 점수 (period feedbacks에서 계산)
    private Map<String, Integer> competencyScores;

    // 비교 기준 점수 (null = 이전/첫 면접 없음)
    private Integer prevSessionScore;

    private Integer firstSessionScore;

    // 최근 3회 면접 중 가장 낮았던 역량 키 (e.g. "fillerWords")
    private String weakestCompetency;

    // 해당 역량에 대한 One Point 코칭 메시지
    private String onePointCoachingMessage;
}

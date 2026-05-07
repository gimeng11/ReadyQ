package com.readyq.model.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalFeedback {

    private int totalScore;

    // 교시별 점수 목록
    private List<Integer> periodScores;

    // 이전 면접 대비 비교 (예: "+4점 향상", "첫 번째 면접입니다.")
    private String comparisonWithPrev;

    private List<String> strongPoints;

    private List<String> improvementPoints;

    private String overallSummary;
}

package com.readyq.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreakTimeResponse {

    private String sessionId;

    private int completedPeriodNum;

    // overallScore + summaryFeedback 만 포함한 요약
    private PeriodFeedbackSummary periodFeedbackSummary;

    private boolean canContinue;

    private String message;  // "쉬는 시간입니다! 다음을 선택하세요."

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodFeedbackSummary {
        private int overallScore;
        private String summaryFeedback;
    }
}

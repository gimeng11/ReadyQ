package com.readyq.dto.interview;

import com.readyq.model.interview.FinalFeedback;
import com.readyq.model.interview.PeriodFeedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalFeedbackResponse {

    private String sessionId;

    private FinalFeedback finalFeedback;

    // 교시별 피드백 전체 목록 (backward compat)
    private List<PeriodFeedback> periodFeedbacks;

    // 교시별 상세 정보 (질문, 전사, 영상 여부, 피드백 포함)
    private List<PeriodDetail> periodDetails;
}

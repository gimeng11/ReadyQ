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

    // 교시별 피드백 전체 목록
    private List<PeriodFeedback> periodFeedbacks;
}

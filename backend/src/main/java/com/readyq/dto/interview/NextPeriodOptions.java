package com.readyq.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextPeriodOptions {

    private String sessionId;

    private int currentPeriod;

    // Gemini가 생성한 꼬리질문 5개
    private List<String> followUpQuestions;

    private boolean newQuestionAvailable;

    private boolean canEndInterview;
}

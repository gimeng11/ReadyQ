package com.readyq.dto.interview;

import lombok.Data;

@Data
public class NextPeriodRequest {

    // FOLLOW_UP | NEW_QUESTION | END_INTERVIEW
    private String choiceType;

    // FOLLOW_UP 선택 시 사용자가 고른 꼬리질문 (nullable)
    private String selectedQuestion;
}

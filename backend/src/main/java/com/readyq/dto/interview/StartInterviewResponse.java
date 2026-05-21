package com.readyq.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartInterviewResponse {

    private String sessionId;

    private int periodNum;      // 항상 1

    private String question;    // 1교시 질문

    private String interviewerType;

    private String message;     // "1교시를 시작합니다!"
}

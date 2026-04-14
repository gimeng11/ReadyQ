package com.readyq.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextPeriodResponse {

    private String sessionId;

    private int periodNum;

    private String question;

    private String questionType;  // INTRO | COMPANY | FOLLOW_UP | NEW

    private String message;
}

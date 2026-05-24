package com.readyq.dto.coverletter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpellerError {
    private String token;       // 잘못된 원문
    private String suggestion;  // 교정 제안
    private String help;        // 오류 설명
    private int startPos;
    private int endPos;
}

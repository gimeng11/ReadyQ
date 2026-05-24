package com.readyq.dto.coverletter;

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
public class CoverLetterReviewResponse {

    // Gemini 첨삭 결과
    private int overallScore;
    private String overallComment;
    private List<String> strengths;
    private List<Map<String, String>> improvements; // {quote, suggestion, reason}

    // 맞춤법 검사 결과
    private List<SpellerError> spellerErrors;
    private boolean spellerAvailable;  // API 호출 성공 여부
    private boolean spellerChecked;    // 검사 시도 여부
}

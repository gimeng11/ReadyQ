package com.readyq.model.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodResult {

    private int periodNum;

    private String question;

    private QuestionType questionType;

    // 영상 저장 경로
    private String videoPath;

    // Gemini File API URI (이후 교시 질문 생성에 재활용)
    private String geminiFileUri;

    // Gemini 파일 MIME 타입
    private String geminiMimeType;

    // Gemini 원본 응답 JSON (raw)
    private String feedbackJson;

    // 파싱된 피드백 객체
    private PeriodFeedback parsedFeedback;

    // submitPeriodAnswer 시 생성한 꼬리질문 5개 (getNextOptions에서 재활용)
    private List<String> followUpQuestions;

    // submitPeriodAnswer 시 백그라운드로 사전 생성된 새 질문 (NEW_QUESTION 즉시 반환용)
    private String preGeneratedNewQuestion;

    private LocalDateTime completedAt;
}

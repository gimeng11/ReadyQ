package com.readyq.dto.interview;

import com.readyq.model.interview.PeriodFeedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodDetail {

    private int periodNum;

    private String question;

    // Gemini STT 전사 텍스트 (영상에서 추출한 사용자 답변)
    private String transcript;

    // 현재 영상 파일이 서버에 존재하는지 여부 (3일 후 삭제)
    private boolean hasVideo;

    private PeriodFeedback feedback;
}

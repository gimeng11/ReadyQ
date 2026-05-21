package com.readyq.dto.interview;

import lombok.Data;

@Data
public class StartInterviewRequest {

    private String interviewerType;  // FRIENDLY | PRESSURE | LOGIC | DEFAULT

    private String title;            // 면접 제목

    private String targetCompany;    // 목표 기업 (선택)

    private String targetJob;        // 목표 직무 (선택)
}

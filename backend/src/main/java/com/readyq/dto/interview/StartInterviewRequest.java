package com.readyq.dto.interview;

import lombok.Data;

@Data
public class StartInterviewRequest {

    private String interviewerType;  // FRIENDLY | PRESSURE | LOGIC | DEFAULT

    private String coverLetter;      // 자기소개서 텍스트

    private String targetCompany;    // 목표 기업

    private String targetJob;        // 목표 직무
}

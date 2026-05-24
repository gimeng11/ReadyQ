package com.readyq.model.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interview_sessions")
public class InterviewSession {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private InterviewerType interviewerType;

    private InterviewStatus status;

    private String coverLetter;

    private String targetCompany;

    private String targetJob;

    // 현재 진행 중인 교시 번호
    private int currentPeriod;

    @Builder.Default
    private List<PeriodResult> periods = new ArrayList<>();

    // 면접 종료 후 생성되는 최종 피드백
    private FinalFeedback finalFeedback;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @Builder.Default
    private boolean pinned = false;
}

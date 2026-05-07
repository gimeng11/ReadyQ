package com.readyq.controller;

import com.readyq.dto.interview.*;
import com.readyq.model.interview.InterviewSession;
import com.readyq.model.interview.PeriodFeedback;
import com.readyq.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    /**
     * POST /api/interview/start
     * 면접 세션 생성 및 1교시 질문 반환
     */
    @PostMapping("/start")
    public ResponseEntity<StartInterviewResponse> startInterview(
            Authentication auth,
            @RequestBody StartInterviewRequest request) {

        StartInterviewResponse response = interviewService.startInterview(
                auth.getName(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/interview/{sessionId}/period/{num}/submit
     * 영상 제출 → Gemini 피드백 생성 → 쉬는시간 응답 반환
     */
    @PostMapping(value = "/{sessionId}/period/{num}/submit",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BreakTimeResponse> submitPeriodAnswer(
            Authentication auth,
            @PathVariable String sessionId,
            @PathVariable int num,
            @RequestPart("video") MultipartFile video) {

        BreakTimeResponse response = interviewService.submitPeriodAnswer(
                auth.getName(), sessionId, num, video);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interview/{sessionId}/period/{num}/options
     * 쉬는시간 선택지 반환 (꼬리질문 5개 + 새질문 + 종료)
     */
    @GetMapping("/{sessionId}/period/{num}/options")
    public ResponseEntity<NextPeriodOptions> getNextOptions(
            Authentication auth,
            @PathVariable String sessionId,
            @PathVariable int num) {

        NextPeriodOptions options = interviewService.getNextOptions(
                auth.getName(), sessionId, num);
        return ResponseEntity.ok(options);
    }

    /**
     * POST /api/interview/{sessionId}/period/{num}/next
     * 선택한 옵션으로 다음 교시 진행 (FOLLOW_UP / NEW_QUESTION / END_INTERVIEW)
     */
    @PostMapping("/{sessionId}/period/{num}/next")
    public ResponseEntity<NextPeriodResponse> proceedToNextPeriod(
            Authentication auth,
            @PathVariable String sessionId,
            @PathVariable int num,
            @RequestBody NextPeriodRequest request) {

        NextPeriodResponse response = interviewService.proceedToNextPeriod(
                auth.getName(), sessionId, num, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/interview/{sessionId}/complete
     * 면접 종료 및 최종 피드백 생성
     */
    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<FinalFeedbackResponse> completeInterview(
            Authentication auth,
            @PathVariable String sessionId) {

        FinalFeedbackResponse response = interviewService.completeInterview(
                auth.getName(), sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interview/history
     * 사용자의 과거 면접 목록 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<InterviewSession>> getInterviewHistory(Authentication auth) {
        List<InterviewSession> history = interviewService.getInterviewHistory(auth.getName());
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/interview/{sessionId}/feedback
     * 특정 세션의 최종 피드백 조회
     */
    @GetMapping("/{sessionId}/feedback")
    public ResponseEntity<FinalFeedbackResponse> getSessionFeedback(
            Authentication auth,
            @PathVariable String sessionId) {

        FinalFeedbackResponse response = interviewService.getSessionFeedback(
                auth.getName(), sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interview/{sessionId}/period/{num}/feedback
     * 특정 교시 피드백 조회
     */
    @GetMapping("/{sessionId}/period/{num}/feedback")
    public ResponseEntity<PeriodFeedback> getPeriodFeedback(
            Authentication auth,
            @PathVariable String sessionId,
            @PathVariable int num) {

        PeriodFeedback feedback = interviewService.getPeriodFeedback(
                auth.getName(), sessionId, num);
        return ResponseEntity.ok(feedback);
    }
}

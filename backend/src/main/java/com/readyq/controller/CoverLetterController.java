package com.readyq.controller;

import com.readyq.dto.coverletter.CoverLetterReviewRequest;
import com.readyq.dto.coverletter.CoverLetterReviewResponse;
import com.readyq.service.CoverLetterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coverletter")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    /**
     * POST /api/coverletter/review
     * 자소서 AI 첨삭 + 맞춤법 검사 (병렬 실행)
     */
    @PostMapping("/review")
    public ResponseEntity<CoverLetterReviewResponse> review(
            Authentication auth,
            @RequestBody CoverLetterReviewRequest request) {

        if (request.getText() == null || request.getText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        CoverLetterReviewResponse response = coverLetterService.review(
                request.getText(), request.isIncludeSpellCheck());

        return ResponseEntity.ok(response);
    }
}

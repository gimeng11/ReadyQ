package com.readyq.controller;

import com.readyq.dto.coverletter.CoverLetterReviewRequest;
import com.readyq.dto.coverletter.CoverLetterReviewResponse;
import com.readyq.dto.coverletter.CoverLetterSaveRequest;
import com.readyq.model.CoverLetterRecord;
import com.readyq.service.CoverLetterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    /**
     * POST /api/coverletter/history
     * 첨삭 결과 저장
     */
    @PostMapping("/history")
    public ResponseEntity<CoverLetterRecord> save(
            Authentication auth,
            @RequestBody CoverLetterSaveRequest request) {
        return ResponseEntity.ok(coverLetterService.save(auth.getName(), request));
    }

    /**
     * GET /api/coverletter/history
     * 저장된 첨삭 목록 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<CoverLetterRecord>> getHistory(Authentication auth) {
        return ResponseEntity.ok(coverLetterService.getHistory(auth.getName()));
    }

    /**
     * DELETE /api/coverletter/history/{id}
     * 저장된 첨삭 삭제
     */
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> delete(
            Authentication auth,
            @PathVariable String id) {
        coverLetterService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/coverletter/history/{id}/title
     * 자소서 제목 수정
     */
    @PatchMapping("/history/{id}/title")
    public ResponseEntity<Void> rename(
            Authentication auth,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        coverLetterService.rename(auth.getName(), id, body.get("title"));
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/coverletter/history/{id}/pin
     * 상단 고정 토글
     */
    @PatchMapping("/history/{id}/pin")
    public ResponseEntity<Map<String, Boolean>> togglePin(
            Authentication auth,
            @PathVariable String id) {
        boolean pinned = coverLetterService.togglePin(auth.getName(), id);
        return ResponseEntity.ok(Map.of("pinned", pinned));
    }
}

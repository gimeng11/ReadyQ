package com.readyq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.readyq.dto.coverletter.CoverLetterReviewResponse;
import com.readyq.dto.coverletter.CoverLetterSaveRequest;
import com.readyq.dto.coverletter.SpellerError;
import com.readyq.model.CoverLetterRecord;
import com.readyq.repository.CoverLetterRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final GeminiInterviewService geminiService;
    private final SpellerService spellerService;
    private final CoverLetterRecordRepository recordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_PROMPT_TEMPLATE =
            "당신은 취업 전문 컨설턴트입니다. 아래 자기소개서를 꼼꼼히 분석해 주세요.\n\n" +
            "자기소개서:\n\"\"\"\n%s\n\"\"\"\n\n" +
            "작성 규칙:\n" +
            "- 모든 텍스트는 '요'체로 작성하세요.\n" +
            "- improvements의 quote는 반드시 원문에서 그대로 인용하세요.\n" +
            "- improvements는 최소 2개, 최대 5개를 작성하세요.\n" +
            "- strengths는 최소 2개를 작성하세요.\n\n" +
            "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
            "{\n" +
            "  \"overallScore\": 0~100 점수,\n" +
            "  \"overallComment\": \"전반적인 평가 (2~3문장)\",\n" +
            "  \"strengths\": [\"강점1\", \"강점2\"],\n" +
            "  \"improvements\": [\n" +
            "    {\n" +
            "      \"quote\": \"원문에서 개선이 필요한 문장\",\n" +
            "      \"suggestion\": \"수정 제안 문장\",\n" +
            "      \"reason\": \"수정 이유 (1문장)\"\n" +
            "    }\n" +
            "  ]\n" +
            "}";

    /**
     * Gemini 첨삭 + 맞춤법 검사를 병렬로 실행한다.
     */
    public CoverLetterReviewResponse review(String text, boolean includeSpellCheck) {
        final String prompt = String.format(GEMINI_PROMPT_TEMPLATE, text);

        long t = System.currentTimeMillis();

        CompletableFuture<String> geminiFuture = CompletableFuture.supplyAsync(() ->
                geminiService.callGeminiTextPublic(prompt));

        // spellerFuture: 성공 → errors 목록, API 불가 → null (구분용)
        CompletableFuture<List<SpellerError>> spellerFuture = includeSpellCheck
                ? CompletableFuture.supplyAsync(() -> {
                    try {
                        return spellerService.check(text);
                    } catch (SpellerService.SpellerUnavailableException e) {
                        log.warn("맞춤법 API 불가: {}", e.getMessage());
                        return null; // null = API 자체 실패
                    } catch (Exception e) {
                        log.warn("맞춤법 검사 오류: {}", e.getMessage());
                        return null;
                    }
                  })
                : CompletableFuture.completedFuture(null);

        String geminiRaw;
        List<SpellerError> spellerErrors;
        boolean spellerAvailable;
        boolean spellerChecked = includeSpellCheck;
        try {
            geminiRaw    = geminiFuture.get(90, TimeUnit.SECONDS);
            List<SpellerError> raw = spellerFuture.get(30, TimeUnit.SECONDS);
            spellerAvailable = (raw != null);          // null = API 실패
            spellerErrors    = raw != null ? raw : List.of();
        } catch (Exception e) {
            throw new RuntimeException("자소서 분석 중 오류: " + e.getMessage(), e);
        }
        log.info("[TIMING] 자소서 첨삭+맞춤법 병렬: {}ms", System.currentTimeMillis() - t);

        return parseGeminiResult(geminiRaw, spellerErrors, spellerAvailable, spellerChecked);
    }

    public CoverLetterRecord save(String userId, CoverLetterSaveRequest request) {
        CoverLetterRecord record = CoverLetterRecord.builder()
                .userId(userId)
                .title(request.getTitle())
                .text(request.getText())
                .overallScore(request.getOverallScore())
                .overallComment(request.getOverallComment())
                .strengths(request.getStrengths())
                .improvements(request.getImprovements())
                .spellerErrors(request.getSpellerErrors())
                .spellerAvailable(request.isSpellerAvailable())
                .spellerChecked(request.isSpellerChecked())
                .createdAt(LocalDateTime.now())
                .build();
        return recordRepository.save(record);
    }

    public List<CoverLetterRecord> getHistory(String userId) {
        return recordRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .sorted((a, b) -> {
                    if (a.isPinned() == b.isPinned()) return 0;
                    return a.isPinned() ? -1 : 1;
                })
                .collect(Collectors.toList());
    }

    public void rename(String userId, String id, String newTitle) {
        if (newTitle == null || newTitle.isBlank()) {
            throw new IllegalArgumentException("제목은 비워둘 수 없습니다.");
        }
        CoverLetterRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        if (!record.getUserId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }
        record.setTitle(newTitle.trim());
        recordRepository.save(record);
    }

    public void delete(String userId, String id) {
        CoverLetterRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        if (!record.getUserId().equals(userId)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }
        recordRepository.delete(record);
    }

    public boolean togglePin(String userId, String id) {
        CoverLetterRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        if (!record.getUserId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }
        record.setPinned(!record.isPinned());
        recordRepository.save(record);
        return record.isPinned();
    }

    private CoverLetterReviewResponse parseGeminiResult(String raw,
                                                         List<SpellerError> spellerErrors,
                                                         boolean spellerAvailable,
                                                         boolean spellerChecked) {
        try {
            String json = geminiService.extractJson(raw);
            JsonNode root = objectMapper.readTree(json);

            int overallScore = root.path("overallScore").asInt(70);
            String overallComment = root.path("overallComment").asText("분석 결과를 불러올 수 없습니다.");

            List<String> strengths = new ArrayList<>();
            root.path("strengths").forEach(n -> strengths.add(n.asText()));

            List<Map<String, String>> improvements = new ArrayList<>();
            root.path("improvements").forEach(n -> {
                Map<String, String> item = new HashMap<>();
                item.put("quote",      n.path("quote").asText(""));
                item.put("suggestion", n.path("suggestion").asText(""));
                item.put("reason",     n.path("reason").asText(""));
                improvements.add(item);
            });

            return CoverLetterReviewResponse.builder()
                    .overallScore(overallScore)
                    .overallComment(overallComment)
                    .strengths(strengths)
                    .improvements(improvements)
                    .spellerErrors(spellerErrors)
                    .spellerAvailable(spellerAvailable)
                    .spellerChecked(spellerChecked)
                    .build();

        } catch (Exception e) {
            log.error("Gemini 자소서 응답 파싱 실패: {}", e.getMessage());
            return CoverLetterReviewResponse.builder()
                    .overallScore(0)
                    .overallComment("분석 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.")
                    .strengths(List.of())
                    .improvements(List.of())
                    .spellerErrors(spellerErrors)
                    .spellerAvailable(spellerAvailable)
                    .spellerChecked(spellerChecked)
                    .build();
        }
    }
}

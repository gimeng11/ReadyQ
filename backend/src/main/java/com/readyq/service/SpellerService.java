package com.readyq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.readyq.dto.coverletter.SpellerError;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Gemini 기반 한국어 맞춤법·띄어쓰기·문법 검사 서비스.
 * 외부 스펠러 API(부산대·네이버)는 서버 호출 시 인증 문제가 있으므로
 * 이미 사용 중인 Gemini를 활용한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SpellerService {

    private final GeminiInterviewService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PROMPT_TEMPLATE =
            "당신은 한국어 맞춤법·띄어쓰기·문법 전문가입니다.\n" +
            "아래 텍스트에서 오류를 찾아주세요.\n\n" +
            "텍스트:\n\"\"\"\n%s\n\"\"\"\n\n" +
            "검사 항목: 맞춤법, 띄어쓰기, 문법 오류\n\n" +
            "규칙:\n" +
            "- 오류가 있으면 각 항목을 JSON 배열로 반환하세요.\n" +
            "- token: 원문에서 잘못된 표현 (그대로 인용)\n" +
            "- suggestion: 올바른 표현\n" +
            "- help: 오류 유형과 이유 (10자 이내)\n" +
            "- 오류가 없으면 빈 배열 []을 반환하세요.\n" +
            "- JSON 배열만 반환하고 다른 텍스트는 절대 포함하지 마세요.\n\n" +
            "예시 출력:\n" +
            "[{\"token\":\"안됩니다\",\"suggestion\":\"안 됩니다\",\"help\":\"띄어쓰기\"}," +
            "{\"token\":\"왠만하면\",\"suggestion\":\"웬만하면\",\"help\":\"맞춤법\"}]";

    /**
     * 자소서 텍스트의 맞춤법·문법 오류 목록을 반환한다.
     *
     * @throws SpellerUnavailableException Gemini 호출 자체 실패 시
     */
    public List<SpellerError> check(String text) {
        if (text == null || text.isBlank()) return List.of();

        String prompt = String.format(PROMPT_TEMPLATE, text);
        String raw;
        try {
            long t = System.currentTimeMillis();
            raw = geminiService.callGeminiTextPublic(prompt);
            log.info("[SPELLER] Gemini 맞춤법 검사: {}ms", System.currentTimeMillis() - t);
        } catch (Exception e) {
            log.error("[SPELLER] Gemini 호출 실패: {}", e.getMessage());
            throw new SpellerUnavailableException("맞춤법 검사 실패: " + e.getMessage());
        }

        return parseErrors(raw);
    }

    private List<SpellerError> parseErrors(String raw) {
        List<SpellerError> errors = new ArrayList<>();
        try {
            // 마크다운 코드블록 제거
            String json = geminiService.extractJson(raw);

            // 최상위가 배열인 경우 처리
            if (!json.startsWith("[")) {
                // 혹시 {"errors":[...]} 형태로 올 때 대비
                JsonNode root = objectMapper.readTree(json);
                JsonNode arr  = root.isArray() ? root : root.path("errors");
                json = objectMapper.writeValueAsString(arr);
            }

            JsonNode arr = objectMapper.readTree(json);
            if (!arr.isArray()) {
                log.warn("[SPELLER] 배열 형식 아님: {}", json.substring(0, Math.min(200, json.length())));
                return List.of();
            }

            for (JsonNode item : arr) {
                String token      = item.path("token").asText("").trim();
                String suggestion = item.path("suggestion").asText("").trim();
                String help       = item.path("help").asText("").trim();

                if (token.isBlank() || token.equals(suggestion)) continue;

                errors.add(SpellerError.builder()
                        .token(token)
                        .suggestion(suggestion)
                        .help(help)
                        .startPos(-1)
                        .endPos(-1)
                        .build());
            }
            log.info("[SPELLER] 오류 {}건 검출", errors.size());
        } catch (Exception e) {
            log.warn("[SPELLER] 응답 파싱 실패: {} / raw={}", e.getMessage(),
                    raw.substring(0, Math.min(200, raw.length())));
        }
        return errors;
    }

    public static class SpellerUnavailableException extends RuntimeException {
        public SpellerUnavailableException(String msg) { super(msg); }
    }
}

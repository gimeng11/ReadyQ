package com.readyq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.readyq.model.interview.InterviewerType;
import com.readyq.model.interview.PeriodFeedback;
import com.readyq.model.interview.FinalFeedback;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiInterviewService {

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final String GEMINI_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
    private static final String GEMINI_MODEL = "gemini-2.0-flash";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ───────────────────────────────────────────────
    // 1. 영상 → Gemini File API 업로드
    // ───────────────────────────────────────────────

    /**
     * 영상 파일을 Gemini File API에 업로드하고 fileUri를 반환한다.
     */
    public String uploadVideoToGemini(MultipartFile video) {
        try {
            String mimeType = video.getContentType() != null ? video.getContentType() : "video/mp4";
            byte[] fileBytes = video.getBytes();

            String boundary = "interview_boundary_" + System.currentTimeMillis();

            String metadataStr = "{\"file\":{\"display_name\":\"" + video.getOriginalFilename() + "\"}}";
            byte[] metadataBytes = metadataStr.getBytes(StandardCharsets.UTF_8);

            String headerPart = "--" + boundary + "\r\n"
                    + "Content-Type: application/json; charset=utf-8\r\n\r\n";
            String filePart = "\r\n--" + boundary + "\r\n"
                    + "Content-Type: " + mimeType + "\r\n\r\n";
            String ending = "\r\n--" + boundary + "--";

            byte[] headerBytes = headerPart.getBytes(StandardCharsets.UTF_8);
            byte[] filePartBytes = filePart.getBytes(StandardCharsets.UTF_8);
            byte[] endingBytes = ending.getBytes(StandardCharsets.UTF_8);

            int totalLen = headerBytes.length + metadataBytes.length + filePartBytes.length
                    + fileBytes.length + endingBytes.length;
            byte[] body = new byte[totalLen];
            int pos = 0;
            System.arraycopy(headerBytes,   0, body, pos, headerBytes.length);   pos += headerBytes.length;
            System.arraycopy(metadataBytes, 0, body, pos, metadataBytes.length); pos += metadataBytes.length;
            System.arraycopy(filePartBytes, 0, body, pos, filePartBytes.length); pos += filePartBytes.length;
            System.arraycopy(fileBytes,     0, body, pos, fileBytes.length);     pos += fileBytes.length;
            System.arraycopy(endingBytes,   0, body, pos, endingBytes.length);

            String responseJson = webClient.post()
                    .uri(GEMINI_UPLOAD_URL + "?key=" + apiKey)
                    .header("X-Goog-Upload-Protocol", "multipart")
                    .contentType(MediaType.parseMediaType("multipart/related; boundary=" + boundary))
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            String fileUri = root.path("file").path("uri").asText();
            String fileName = root.path("file").path("name").asText();

            // 영상 처리 완료까지 대기
            waitForFileActive(fileName);
            return fileUri;

        } catch (Exception e) {
            log.error("Gemini 파일 업로드 실패", e);
            throw new RuntimeException("영상 업로드에 실패했습니다.", e);
        }
    }

    /**
     * 파일 상태가 ACTIVE가 될 때까지 최대 30초간 폴링한다.
     */
    private void waitForFileActive(String fileName) {
        for (int i = 0; i < 15; i++) {
            try {
                String resp = webClient.get()
                        .uri(GEMINI_BASE_URL + "/" + fileName + "?key=" + apiKey)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
                if (resp != null && resp.contains("\"state\":\"ACTIVE\"")) {
                    return;
                }
                Thread.sleep(2000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                log.warn("파일 상태 확인 실패 ({}회 시도)", i + 1, e);
            }
        }
        log.warn("파일 ACTIVE 상태 확인 타임아웃 — 처리를 계속합니다.");
    }

    // ───────────────────────────────────────────────
    // 2. 초기 질문 생성
    // ───────────────────────────────────────────────

    /**
     * 자기소개서 · 직무 정보를 바탕으로 1교시 첫 질문을 생성한다.
     */
    public String generateInitialQuestion(String coverLetter,
                                          String targetCompany,
                                          String targetJob,
                                          InterviewerType interviewerType) {
        String interviewerDescription = getInterviewerDescription(interviewerType);
        String prompt = String.format(
                "%s\n\n지원자는 %s의 %s 직무에 지원했습니다.\n" +
                "자기소개서: %s\n\n" +
                "면접 첫 번째 질문(자기소개 요청 또는 지원 동기 질문)을 한 문장으로만 생성해주세요. " +
                "질문 외에 다른 텍스트는 절대 포함하지 마세요.",
                interviewerDescription, targetCompany, targetJob, coverLetter);

        return callGeminiText(prompt).trim();
    }

    // ───────────────────────────────────────────────
    // 3. 교시 피드백 생성
    // ───────────────────────────────────────────────

    /**
     * 영상 URI와 질문을 기반으로 교시 피드백 JSON을 생성한다.
     *
     * @return 순수 JSON 문자열 (PeriodFeedback 구조)
     */
    public String generatePeriodFeedback(String fileUri,
                                         String question,
                                         InterviewerType interviewerType,
                                         String coverLetter) {
        String interviewerDescription = getInterviewerDescription(interviewerType);
        String prompt = String.format(
                "%s\n\n" +
                "질문: %s\n" +
                "지원자 자기소개서: %s\n\n" +
                "위 영상에서 지원자의 답변을 분석하여 다음 항목을 0~100점으로 평가하고, " +
                "preamble 없이 순수 JSON만 반환하세요.\n\n" +
                "평가항목:\n" +
                "- logicStructure: 논리구조력\n" +
                "- speechSpeed: 말하기속도 (적절할수록 높은 점수)\n" +
                "- voiceVolume: 음성크기 (적절할수록 높은 점수)\n" +
                "- eyeContact: 시선처리\n" +
                "- fillerWords: 추임새빈도 (적을수록 높은 점수)\n" +
                "- answerClarity: 답변명확성\n\n" +
                "반환 형식 (JSON만, 마크다운 코드블록 없이):\n" +
                "{\n" +
                "  \"scores\": {\n" +
                "    \"logicStructure\": 점수,\n" +
                "    \"speechSpeed\": 점수,\n" +
                "    \"voiceVolume\": 점수,\n" +
                "    \"eyeContact\": 점수,\n" +
                "    \"fillerWords\": 점수,\n" +
                "    \"answerClarity\": 점수\n" +
                "  },\n" +
                "  \"overallScore\": 종합점수,\n" +
                "  \"summaryFeedback\": \"한 문장 요약\",\n" +
                "  \"detailFeedback\": {\n" +
                "    \"logicStructure\": \"상세 피드백\",\n" +
                "    \"speechSpeed\": \"상세 피드백\",\n" +
                "    \"voiceVolume\": \"상세 피드백\",\n" +
                "    \"eyeContact\": \"상세 피드백\",\n" +
                "    \"fillerWords\": \"상세 피드백\",\n" +
                "    \"answerClarity\": \"상세 피드백\"\n" +
                "  },\n" +
                "  \"improvementTips\": [\"팁1\", \"팁2\", \"팁3\"]\n" +
                "}",
                interviewerDescription, question, coverLetter);

        String raw = callGeminiWithVideo(fileUri, prompt);
        return extractJson(raw);
    }

    // ───────────────────────────────────────────────
    // 4. 꼬리질문 생성
    // ───────────────────────────────────────────────

    /**
     * 이전 답변 영상을 분석하여 꼬리질문 5개를 반환한다.
     */
    public List<String> generateFollowUpQuestions(String fileUri, String prevQuestion) {
        String prompt = String.format(
                "이전 면접 답변 영상을 분석하여 자연스럽게 이어질 수 있는 꼬리질문 5개를 생성해주세요.\n" +
                "이전 질문: %s\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\"questions\": [\"질문1\", \"질문2\", \"질문3\", \"질문4\", \"질문5\"]}",
                prevQuestion);

        String raw = callGeminiWithVideo(fileUri, prompt);
        String json = extractJson(raw);
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode questionsNode = root.path("questions");
            List<String> questions = new ArrayList<>();
            if (questionsNode.isArray()) {
                questionsNode.forEach(q -> questions.add(q.asText()));
            }
            return questions;
        } catch (Exception e) {
            log.error("꼬리질문 파싱 실패. raw={}", raw, e);
            return List.of("이전 답변에서 더 자세히 설명해 주실 수 있나요?",
                           "그렇게 생각하신 근거가 있나요?",
                           "구체적인 사례를 들어 주실 수 있나요?",
                           "다른 방법은 고려해 보셨나요?",
                           "그 경험에서 무엇을 배우셨나요?");
        }
    }

    // ───────────────────────────────────────────────
    // 5. 새로운 질문 생성 (다른 질문 선택 시)
    // ───────────────────────────────────────────────

    /**
     * 이전 질문들과 겹치지 않는 새로운 회사/직무 관련 질문을 생성한다.
     */
    public String generateNewQuestion(String coverLetter,
                                      String targetCompany,
                                      String targetJob,
                                      List<String> previousQuestions) {
        String prevQuestionsStr = String.join("\n- ", previousQuestions);
        String prompt = String.format(
                "%s 회사의 %s 직무 면접에서 사용할 새로운 질문을 1개 생성해주세요.\n" +
                "자기소개서: %s\n\n" +
                "이미 사용한 질문 (중복 금지):\n- %s\n\n" +
                "직무 역량, 문제해결 경험, 협업 능력 중 한 가지를 중심으로 " +
                "질문 한 문장만 반환하세요. 다른 텍스트는 포함하지 마세요.",
                targetCompany, targetJob, coverLetter, prevQuestionsStr);

        return callGeminiText(prompt).trim();
    }

    // ───────────────────────────────────────────────
    // 6. 최종 피드백 생성
    // ───────────────────────────────────────────────

    /**
     * 전체 교시별 피드백 JSON 목록을 종합하여 최종 피드백 JSON을 생성한다.
     *
     * @return 순수 JSON 문자열 (FinalFeedback 구조)
     */
    public String generateFinalFeedback(List<String> periodFeedbackJsonList) {
        String feedbackList = String.join(",\n", periodFeedbackJsonList);
        String prompt = String.format(
                "다음은 면접 전체 교시별 피드백 JSON 목록입니다. 이를 종합하여 최종 피드백을 생성해주세요.\n\n" +
                "교시별 피드백:\n[%s]\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\n" +
                "  \"totalScore\": 종합점수,\n" +
                "  \"periodScores\": [교시1점수, 교시2점수, ...],\n" +
                "  \"strongPoints\": [\"강점1\", \"강점2\", \"강점3\"],\n" +
                "  \"improvementPoints\": [\"개선점1\", \"개선점2\", \"개선점3\"],\n" +
                "  \"overallSummary\": \"전체 요약 한 문단\"\n" +
                "}",
                feedbackList);

        String raw = callGeminiText(prompt);
        return extractJson(raw);
    }

    // ───────────────────────────────────────────────
    // Private helpers
    // ───────────────────────────────────────────────

    /**
     * 영상 URI 없이 텍스트만으로 Gemini 호출
     */
    private String callGeminiText(String prompt) {
        try {
            Map<String, Object> request = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            String body = objectMapper.writeValueAsString(request);

            String response = webClient.post()
                    .uri(GEMINI_BASE_URL + "/models/" + GEMINI_MODEL + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            log.error("Gemini 텍스트 호출 실패", e);
            throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
        }
    }

    /**
     * 영상 fileUri를 포함하여 Gemini 호출
     */
    private String callGeminiWithVideo(String fileUri, String prompt) {
        try {
            Map<String, Object> filePart = Map.of(
                    "file_data", Map.of(
                            "mime_type", "video/mp4",
                            "file_uri", fileUri
                    )
            );
            Map<String, Object> textPart = Map.of("text", prompt);

            Map<String, Object> request = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(filePart, textPart))
                    )
            );

            String body = objectMapper.writeValueAsString(request);

            String response = webClient.post()
                    .uri(GEMINI_BASE_URL + "/models/" + GEMINI_MODEL + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            log.error("Gemini 영상 포함 호출 실패", e);
            throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
        }
    }

    /**
     * Gemini generateContent 응답에서 텍스트 부분만 추출
     */
    private String extractTextFromResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates")
                       .path(0)
                       .path("content")
                       .path("parts")
                       .path(0)
                       .path("text")
                       .asText();
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 실패. responseJson={}", responseJson, e);
            throw new RuntimeException("Gemini 응답을 파싱할 수 없습니다.", e);
        }
    }

    /**
     * 텍스트에서 JSON 블록만 추출한다.
     * Gemini가 마크다운 코드블록(```json ... ```)으로 감싸는 경우를 처리한다.
     */
    String extractJson(String text) {
        if (text == null || text.isBlank()) return "{}";

        // 마크다운 코드블록 제거
        Pattern codeBlock = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");
        Matcher matcher = codeBlock.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        // 중괄호 기준으로 JSON 범위 추출
        int start = text.indexOf('{');
        int end   = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1).trim();
        }

        return text.trim();
    }

    /**
     * 면접관 유형별 프롬프트 서두 반환
     */
    private String getInterviewerDescription(InterviewerType type) {
        return switch (type) {
            case FRIENDLY -> "당신은 친절하고 격려적인 면접관입니다. 지원자의 답변을 긍정적으로 바라보되 건설적인 피드백을 제공해주세요.";
            case PRESSURE -> "당신은 압박형 면접관입니다. 지원자의 약점을 날카롭게 짚어내고 개선점을 직접적으로 제시해주세요. 완곡한 표현보다 명확하고 직접적인 지적을 선호합니다.";
            case LOGIC   -> "당신은 논리 검증형 면접관입니다. 지원자의 답변에서 논리적 허점과 근거의 빈약함을 중심으로 비판적으로 분석하고 피드백해주세요.";
            case DEFAULT -> "당신은 전문적인 면접관입니다. 균형 잡힌 시각으로 지원자의 답변을 평가하고 피드백을 제공해주세요.";
        };
    }

    // ───────────────────────────────────────────────
    // JSON → 객체 파싱 (InterviewService에서 사용)
    // ───────────────────────────────────────────────

    public PeriodFeedback parsePeriodFeedback(String json) {
        try {
            return objectMapper.readValue(json, PeriodFeedback.class);
        } catch (Exception e) {
            log.error("PeriodFeedback 파싱 실패. json={}", json, e);
            return PeriodFeedback.builder()
                    .scores(new HashMap<>())
                    .overallScore(0)
                    .summaryFeedback("피드백을 불러올 수 없습니다.")
                    .detailFeedback(new HashMap<>())
                    .improvementTips(new ArrayList<>())
                    .build();
        }
    }

    public FinalFeedback parseFinalFeedback(String json) {
        try {
            return objectMapper.readValue(json, FinalFeedback.class);
        } catch (Exception e) {
            log.error("FinalFeedback 파싱 실패. json={}", json, e);
            return FinalFeedback.builder()
                    .totalScore(0)
                    .periodScores(new ArrayList<>())
                    .strongPoints(new ArrayList<>())
                    .improvementPoints(new ArrayList<>())
                    .overallSummary("최종 피드백을 불러올 수 없습니다.")
                    .build();
        }
    }
}

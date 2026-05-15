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

import reactor.util.retry.Retry;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiInterviewService {

    public record GeminiFileRef(String uri, String mimeType) {}

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final String GEMINI_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
    private static final String GEMINI_MODEL = "gemini-2.5-flash";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ───────────────────────────────────────────────
    // 1. 영상 → Gemini File API 업로드
    // ───────────────────────────────────────────────

    /**
     * 영상 파일을 Gemini File API에 업로드하고 URI와 실제 MIME 타입을 반환한다.
     */
    public GeminiFileRef uploadVideoToGemini(MultipartFile video) {
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
            return new GeminiFileRef(fileUri, mimeType);

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
     * 1교시는 항상 고정 자기소개 질문을 반환한다.
     */
    public String generateInitialQuestion(String coverLetter,
                                          String targetCompany,
                                          String targetJob,
                                          InterviewerType interviewerType) {
        return "1분 30초 이내로 간단한 자기소개를 해주세요.";
    }

    /**
     * 1교시 자기소개 영상을 분석하여 이후 교시 질문을 생성한다.
     */
    public String generateQuestionFromIntroVideo(String introFileUri,
                                                  String introMimeType,
                                                  String coverLetter,
                                                  String targetCompany,
                                                  String targetJob,
                                                  InterviewerType interviewerType,
                                                  List<String> previousQuestions) {
        String interviewerDescription = getInterviewerDescription(interviewerType);
        String prevQuestionsStr = previousQuestions.isEmpty() ? "없음" : String.join("\n- ", previousQuestions);
        String prompt = String.format(
                "%s\n\n" +
                "지원자는 %s의 %s 직무에 지원했습니다.\n" +
                "위 영상은 지원자의 1분 30초 자기소개 영상입니다. " +
                "이 자기소개 내용을 바탕으로 심층 면접 질문 1개를 생성해주세요.\n" +
                "이미 사용한 질문 (중복 금지):\n- %s\n\n" +
                "질문 한 문장만 반환하세요. 다른 텍스트는 포함하지 마세요.",
                interviewerDescription, targetCompany, targetJob, prevQuestionsStr);

        try {
            return extractLastLine(callGeminiWithVideo(introFileUri, introMimeType, prompt));
        } catch (Exception e) {
            log.warn("자기소개 영상 기반 질문 생성 실패 — 텍스트 기반으로 대체: {}", e.getMessage());
            return generateNewQuestion(coverLetter, targetCompany, targetJob, previousQuestions);
        }
    }

    private String extractLastLine(String text) {
        if (text == null || text.isBlank()) return text == null ? "" : text.trim();
        String[] lines = text.split("[\\n\\r]+");
        for (int i = lines.length - 1; i >= 0; i--) {
            String line = lines[i].trim();
            if (!line.isEmpty()) return line;
        }
        return text.trim();
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
                                         String mimeType,
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

                "=== 항목별 평가 기준 ===\n\n" +

                "[speechSpeed - 말하기 속도]\n" +
                "영상에서 발화 속도를 SPM(분당 음절 수)으로 추정하여 평가하세요.\n" +
                "- 이상적 면접 범위: 265 ~ 350 SPM (한국 성인 평균 265SPM, 아나운서 기준 350SPM)\n" +
                "- 정상 허용 범위: 250 ~ 410 SPM\n" +
                "- 250 SPM 미만: '너무 느림' → 감점\n" +
                "- 410 SPM 초과: '너무 빠름' → 감점\n" +
                "출처: 신문자(2003), 김국환(2021)\n\n" +

                "[fillerWords - 추임새/말더듬]\n" +
                "'음', '어', '그', '저' 등 불필요한 추임새 및 말더듬 횟수를 영상 길이 기준으로 평가하세요.\n" +
                "- 1분 이상 영상: 분당 5회 이하 → 양호 / 6~11회 → 주의 / 12회 이상 → 감점\n" +
                "- 1분 미만 영상: 5초당 1회 이상이면 감점\n" +
                "출처: Laske et al. (2024) Journal of Applied Behavior Analysis\n\n" +

                "[eyeContact - 비언어적 태도]\n" +
                "눈맞춤, 미소, 고개끄덕임 여부를 주요 기준으로 평가하세요.\n" +
                "한국 면접관 중요도 순서: 말하고듣는태도(63.5%%) > 얼굴표정(49.1%%) > 시선처리(41.3%%) > 자세(37.6%%)\n" +
                "눈맞춤·미소·고개끄덕임 사용 시 면접관 평가 유의미하게 상승 (사용 3.94/5점 vs 미사용 2.78/5점, p<.001)\n" +
                "출처: 박소현·유태용(2014), 엔터웨이파트너스 설문\n\n" +

                "[voiceVolume - 목소리 전달력]\n" +
                "억양 변화폭, 음도(기본주파수), 강도(dB)를 종합하여 평가하세요.\n" +
                "- 남성 기준: 억양변화 90Hz 이상, 음도 111~130Hz, 강도 67~72dB → 호감\n" +
                "  (103.1Hz 억양이 호감 1위, 70.5Hz는 비호감 1위 / 108Hz 이하 음도는 낮음)\n" +
                "- 여성 기준: 억양변화 121Hz 이상, 음도 231~250Hz, 강도 67~72dB → 호감\n" +
                "  (136.4Hz 억양이 호감 1위 / 200Hz 이하 음도는 낮음)\n" +
                "- 강도 55~60dB 이하: 약함 → 감점\n" +
                "- 단조로운 억양(변화 없음)은 비호감의 핵심 원인으로 감점\n" +
                "출처: 아나운서 연구(남 158.8Hz, 여 250.7Hz 참고)\n\n" +

                "[logicStructure - 논리구조력]\n" +
                "답변의 주장-근거-사례 구조가 갖춰졌는지, 결론 도출에 비약이 없는지 평가하세요.\n\n" +

                "[answerClarity - 답변명확성]\n" +
                "질문 의도에 정확히 답했는지, 핵심 메시지가 명확히 전달되었는지 평가하세요.\n\n" +

                "=== 반환 형식 (JSON만, 마크다운 코드블록 없이) ===\n" +
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
                "    \"speechSpeed\": \"추정 SPM 수치와 함께 상세 피드백\",\n" +
                "    \"voiceVolume\": \"억양·음도·강도 기준 수치와 함께 상세 피드백\",\n" +
                "    \"eyeContact\": \"눈맞춤·표정·자세 관찰 내용 상세 피드백\",\n" +
                "    \"fillerWords\": \"추임새 횟수 추정과 함께 상세 피드백\",\n" +
                "    \"answerClarity\": \"상세 피드백\"\n" +
                "  },\n" +
                "  \"improvementTips\": [\"팁1\", \"팁2\", \"팁3\"]\n" +
                "}",
                interviewerDescription, question, coverLetter);

        try {
            String raw = callGeminiWithVideo(fileUri, mimeType, prompt);
            return extractJson(raw);
        } catch (Exception e) {
            log.warn("Gemini 피드백 생성 실패 — 기본 피드백 사용: {}", e.getMessage());
            return "{\"scores\":{\"logicStructure\":70,\"speechSpeed\":70,\"voiceVolume\":70,\"eyeContact\":70,\"fillerWords\":70,\"answerClarity\":70}," +
                   "\"overallScore\":70,\"summaryFeedback\":\"AI 분석을 일시적으로 사용할 수 없습니다. 답변을 잘 하셨습니다.\"," +
                   "\"detailFeedback\":{\"logicStructure\":\"분석 불가\",\"speechSpeed\":\"분석 불가\",\"voiceVolume\":\"분석 불가\",\"eyeContact\":\"분석 불가\",\"fillerWords\":\"분석 불가\",\"answerClarity\":\"분석 불가\"}," +
                   "\"improvementTips\":[\"다음 답변에서도 자신감 있게 말해보세요.\",\"핵심을 먼저 말하는 두괄식 구조를 활용해 보세요.\",\"구체적인 사례를 들어 답변을 풍부하게 만들어 보세요.\"]}";
        }
    }

    // ───────────────────────────────────────────────
    // 4. 꼬리질문 생성
    // ───────────────────────────────────────────────

    /**
     * 이전 답변 영상을 분석하여 꼬리질문 5개를 반환한다.
     */
    public List<String> generateFollowUpQuestions(String fileUri, String mimeType, String prevQuestion) {
        String prompt = String.format(
                "이전 면접 답변 영상을 분석하여 자연스럽게 이어질 수 있는 꼬리질문 5개를 생성해주세요.\n" +
                "이전 질문: %s\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\"questions\": [\"질문1\", \"질문2\", \"질문3\", \"질문4\", \"질문5\"]}",
                prevQuestion);

        String raw;
        try {
            raw = callGeminiWithVideo(fileUri, mimeType, prompt);
        } catch (Exception e) {
            log.warn("꼬리질문 Gemini 호출 실패 — 기본 질문 반환: {}", e.getMessage());
            return List.of("이전 답변에서 더 자세히 설명해 주실 수 있나요?",
                           "그렇게 생각하신 근거가 있나요?",
                           "구체적인 사례를 들어 주실 수 있나요?",
                           "다른 방법은 고려해 보셨나요?",
                           "그 경험에서 무엇을 배우셨나요?");
        }
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
                "이미 사용한 질문 (중복 금지):\n- %s\n\n" +
                "직무 역량, 문제해결 경험, 협업 능력 중 한 가지를 중심으로 " +
                "질문 한 문장만 반환하세요. 다른 텍스트는 포함하지 마세요.",
                targetCompany, targetJob, prevQuestionsStr);

        try {
            return callGeminiText(prompt).trim();
        } catch (Exception e) {
            log.warn("Gemini 새 질문 생성 실패 — 기본 질문 사용: {}", e.getMessage());
            List<String> fallbackQuestions = List.of(
                "지원한 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?",
                "본인의 강점과 약점을 각각 한 가지씩 말씀해 주세요.",
                "팀 프로젝트에서 갈등을 해결한 경험이 있다면 말씀해 주세요.",
                "5년 후 본인의 커리어 목표는 무엇인가요?",
                "가장 어려웠던 문제를 해결한 경험을 말씀해 주세요."
            );
            // 이전 질문 목록과 겹치지 않는 것 선택
            return fallbackQuestions.stream()
                .filter(q -> !previousQuestions.contains(q))
                .findFirst()
                .orElse("본인이 이 직무에 적합한 이유를 말씀해 주세요.");
        }
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
                "작성 규칙:\n" +
                "- 모든 텍스트는 '요'체로 작성하세요 (예: ~해요, ~이에요, ~있어요, ~세요).\n" +
                "- strongPoints와 improvementPoints 각 항목은 30자 이내로 간결하게 작성하세요.\n" +
                "- overallSummary는 100자 이내로 작성하세요.\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\n" +
                "  \"totalScore\": 종합점수,\n" +
                "  \"periodScores\": [교시1점수, 교시2점수, ...],\n" +
                "  \"strongPoints\": [\"강점1\", \"강점2\", \"강점3\"],\n" +
                "  \"improvementPoints\": [\"개선점1\", \"개선점2\", \"개선점3\"],\n" +
                "  \"overallSummary\": \"전체 요약\"\n" +
                "}",
                feedbackList);

        try {
            String raw = callGeminiText(prompt);
            return extractJson(raw);
        } catch (Exception e) {
            log.warn("Gemini 최종 피드백 생성 실패 — 기본 피드백 사용: {}", e.getMessage());
            // periodFeedbackJsonList에서 점수 평균 계산
            int total = 0;
            List<Integer> scores = new ArrayList<>();
            for (String pfJson : periodFeedbackJsonList) {
                try {
                    JsonNode node = objectMapper.readTree(pfJson);
                    int s = node.path("overallScore").asInt(70);
                    scores.add(s);
                    total += s;
                } catch (Exception ignored) {
                    scores.add(70);
                    total += 70;
                }
            }
            int avg = scores.isEmpty() ? 70 : total / scores.size();
            String scoresJson = scores.toString();
            return String.format(
                "{\"totalScore\":%d,\"periodScores\":%s," +
                "\"strongPoints\":[\"면접에 성실히 임하셨습니다.\",\"질문에 충실하게 답변하셨습니다.\"]," +
                "\"improvementPoints\":[\"답변을 더 구체적으로 준비해 보세요.\",\"핵심 메시지를 먼저 전달하는 연습을 해보세요.\"]," +
                "\"overallSummary\":\"AI 분석을 일시적으로 사용할 수 없습니다. 면접에 성실히 임해주셔서 감사합니다.\"}",
                avg, scoresJson);
        }
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
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(errBody -> log.warn("Gemini {} 응답 본문: {}", clientResponse.statusCode().value(), errBody))
                                    .flatMap(errBody -> reactor.core.publisher.Mono.error(
                                            new org.springframework.web.reactive.function.client.WebClientResponseException(
                                                    clientResponse.statusCode().value(), clientResponse.statusCode().toString(), null, errBody.getBytes(), null))))
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(5))
                            .filter(e -> {
                                if (!(e instanceof org.springframework.web.reactive.function.client.WebClientResponseException ex)) return false;
                                int status = ex.getStatusCode().value();
                                if (status == 503) return true;
                                if (status != 429) return false;
                                // 월 한도 초과(RESOURCE_EXHAUSTED)는 재시도 불필요
                                String errBody = ex.getResponseBodyAsString();
                                return !errBody.contains("RESOURCE_EXHAUSTED") && !errBody.contains("spending cap");
                            })
                            .doBeforeRetry(rs -> log.warn("Gemini 429/503 — {}초 후 재시도 ({}/2)", 5 * (1L << rs.totalRetries()), rs.totalRetries() + 1)))
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            String safeMsg = e.getMessage() != null ? e.getMessage().replace(apiKey, "***") : "unknown";
            log.error("Gemini 텍스트 호출 실패: {}", safeMsg);
            throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
        }
    }

    /**
     * 영상 fileUri를 포함하여 Gemini 호출
     */
    private String callGeminiWithVideo(String fileUri, String mimeType, String prompt) {
        try {
            Map<String, Object> filePart = Map.of(
                    "file_data", Map.of(
                            "mime_type", mimeType,
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
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(errBody -> log.warn("Gemini(video) {} 응답 본문: {}", clientResponse.statusCode().value(), errBody))
                                    .flatMap(errBody -> reactor.core.publisher.Mono.error(
                                            new org.springframework.web.reactive.function.client.WebClientResponseException(
                                                    clientResponse.statusCode().value(), clientResponse.statusCode().toString(), null, errBody.getBytes(), null))))
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(5))
                            .filter(e -> {
                                if (!(e instanceof org.springframework.web.reactive.function.client.WebClientResponseException ex)) return false;
                                int status = ex.getStatusCode().value();
                                if (status == 503) return true;
                                if (status != 429) return false;
                                // 월 한도 초과(RESOURCE_EXHAUSTED)는 재시도 불필요
                                String errBody = ex.getResponseBodyAsString();
                                return !errBody.contains("RESOURCE_EXHAUSTED") && !errBody.contains("spending cap");
                            })
                            .doBeforeRetry(rs -> log.warn("Gemini 429/503 — {}초 후 재시도 ({}/2)", 5 * (1L << rs.totalRetries()), rs.totalRetries() + 1)))
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            String safeMsg = e.getMessage() != null ? e.getMessage().replace(apiKey, "***") : "unknown";
            log.error("Gemini 영상 포함 호출 실패: {}", safeMsg);
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
            case FRIENDLY ->
                "당신은 따뜻하고 격려를 중심으로 하는 면접관입니다. " +
                "지원자의 답변에서 잘한 점과 노력한 부분을 먼저 충분히 칭찬하고, " +
                "개선점도 '더 잘할 수 있다'는 긍정적 관점에서 부드럽게 제안해주세요. " +
                "지원자가 자신감을 잃지 않도록 응원하는 어조를 유지하세요.";
            case PRESSURE ->
                "당신은 날카롭고 직설적인 압박형 면접관입니다. " +
                "지원자 답변의 허점, 모호한 표현, 준비 부족을 가감 없이 지적하세요. " +
                "완곡한 표현은 쓰지 말고, '이 부분은 명백히 부족합니다', '근거가 없습니다' 등 " +
                "강한 어조로 문제점을 직접 짚어 개선을 요구하세요.";
            case LOGIC   ->
                "당신은 논리적 근거를 최우선으로 검증하는 면접관입니다. " +
                "지원자의 답변이 근거가 충분한지, 주장과 사례가 일관된지, " +
                "결론 도출 과정에 비약은 없는지를 중심으로 분석하세요. " +
                "감정적 표현이나 단순 인상 평가 없이 논리 구조와 데이터·사실 기반의 근거 여부만으로 평가하세요.";
            case DEFAULT ->
                "당신은 균형 잡힌 전문 면접관입니다. " +
                "지원자의 답변을 과도한 칭찬이나 혹독한 비판 없이 중립적으로 평가하세요. " +
                "강점과 개선점을 동등한 비중으로 제시하고, 사실에 근거한 객관적인 피드백을 제공해주세요.";
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

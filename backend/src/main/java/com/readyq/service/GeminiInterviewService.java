package com.readyq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
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

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiInterviewService {

    public record GeminiFileRef(String uri, String mimeType) {}
    public record PeriodAnalysisResult(String feedbackJson, List<String> followUpQuestions) {}

    private static final List<String> COMPETENCY_KEYS = List.of(
            "logicStructure", "speechSpeed", "voiceVolume", "eyeContact", "fillerWords", "answerClarity");

    private static final Map<String, String> COMPETENCY_KO = Map.of(
            "logicStructure", "논리 구조력",
            "speechSpeed",    "말하기 속도",
            "voiceVolume",    "목소리 전달력",
            "eyeContact",     "비언어적 태도",
            "fillerWords",    "발화 유창성",
            "answerClarity",  "답변 명확성");

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final String GEMINI_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
    private static final String GEMINI_MODEL = "gemini-2.5-flash";

    @Value("${gemini.api.key}")
    private String apiKey;

    // WebClient: File upload (resumable) + waitForFileActive polling
    private final WebClient webClient;
    // Google GenAI SDK: generateContent 호출
    private final Client geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ───────────────────────────────────────────────
    // 1. 영상 → Gemini File API 업로드
    // ───────────────────────────────────────────────

    /**
     * 영상 파일을 Gemini File API에 업로드하고 URI와 실제 MIME 타입을 반환한다.
     */
    public GeminiFileRef uploadVideoToGemini(MultipartFile video) {
        int maxAttempts = 3;
        Exception lastException = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return doUploadVideoToGemini(video);
            } catch (Exception e) {
                lastException = e;
                boolean retryable = isRetryableUploadError(e);
                log.warn("Gemini 업로드 시도 {}/{} 실패 (재시도 가능: {}): {}", attempt, maxAttempts, retryable, e.getMessage());
                if (!retryable || attempt == maxAttempts) break;
                try {
                    Thread.sleep(Duration.ofSeconds(3L * attempt).toMillis());
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        log.error("Gemini 파일 업로드 최종 실패", lastException);
        throw new RuntimeException("영상 업로드에 실패했습니다.", lastException);
    }

    private GeminiFileRef doUploadVideoToGemini(MultipartFile video) throws Exception {
        String mimeType = video.getContentType() != null ? video.getContentType() : "video/mp4";
        byte[] fileBytes = video.getBytes();
        log.info("업로드 파일 크기: {}KB ({}MB)", fileBytes.length / 1024, fileBytes.length / 1024 / 1024);

        long tUpload = System.currentTimeMillis();

        // Step 1: resumable 세션 시작 → upload URI 수령 (새 세션 발급)
        String metadataJson = "{\"file\":{\"display_name\":\"" + video.getOriginalFilename() + "\"}}";
        String uploadUri = webClient.post()
                .uri(GEMINI_UPLOAD_URL + "?key=" + apiKey)
                .header("X-Goog-Upload-Protocol", "resumable")
                .header("X-Goog-Upload-Command", "start")
                .header("X-Goog-Upload-Header-Content-Length", String.valueOf(fileBytes.length))
                .header("X-Goog-Upload-Header-Content-Type", mimeType)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(metadataJson)
                .retrieve()
                .onStatus(status -> status.isError(),
                        resp -> resp.bodyToMono(String.class).defaultIfEmpty("")
                                .doOnNext(b -> log.error("Gemini 업로드 Step1 {} body: {}", resp.statusCode().value(), b))
                                .flatMap(b -> reactor.core.publisher.Mono.error(
                                        new org.springframework.web.reactive.function.client.WebClientResponseException(
                                                resp.statusCode().value(), resp.statusCode().toString(), null, b.getBytes(), null))))
                .toBodilessEntity()
                .mapNotNull(resp -> resp.getHeaders().getFirst("X-Goog-Upload-URL"))
                .block();

        if (uploadUri == null) {
            throw new RuntimeException("Gemini resumable upload URI를 받지 못했습니다.");
        }

        // Step 2: 파일 데이터 전송 + finalize (retryWhen 없음 — 실패 시 외부 루프에서 Step 1부터 재시도)
        String responseJson = webClient.post()
                .uri(uploadUri)
                .header("Content-Length", String.valueOf(fileBytes.length))
                .header("X-Goog-Upload-Offset", "0")
                .header("X-Goog-Upload-Command", "upload, finalize")
                .bodyValue(fileBytes)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .doOnNext(errBody -> log.error("Gemini 업로드 Step2 {} 응답: {}", clientResponse.statusCode().value(), errBody))
                                .flatMap(errBody -> reactor.core.publisher.Mono.error(
                                        new org.springframework.web.reactive.function.client.WebClientResponseException(
                                                clientResponse.statusCode().value(), clientResponse.statusCode().toString(), null, errBody.getBytes(), null))))
                .bodyToMono(String.class)
                .block();
        log.info("[TIMING] Gemini resumable 업로드: {}ms", System.currentTimeMillis() - tUpload);

        if (responseJson == null || responseJson.isBlank()) {
            throw new RuntimeException("Gemini 파일 업로드 응답이 비어 있습니다.");
        }
        JsonNode root = objectMapper.readTree(responseJson);
        String fileUri = root.path("file").path("uri").asText();
        String fileName = root.path("file").path("name").asText();

        long tActive = System.currentTimeMillis();
        waitForFileActive(fileName);
        log.info("[TIMING] Gemini ACTIVE 대기: {}ms", System.currentTimeMillis() - tActive);
        return new GeminiFileRef(fileUri, mimeType);
    }

    private boolean isRetryableUploadError(Throwable e) {
        Throwable cause = e;
        while (cause != null) {
            if (cause instanceof org.springframework.web.reactive.function.client.WebClientResponseException ex) {
                int status = ex.getStatusCode().value();
                String body = ex.getResponseBodyAsString();
                return status == 503 || body.contains("Upload has already been terminated");
            }
            cause = cause.getCause();
        }
        return false;
    }

    /**
     * 파일 상태가 ACTIVE가 될 때까지 폴링한다.
     * 처음 10번은 500ms 간격, 이후는 2000ms 간격으로 최대 50초간 대기.
     */
    private void waitForFileActive(String fileName) {
        int maxAttempts = 35;
        for (int i = 0; i < maxAttempts; i++) {
            try {
                String resp = webClient.get()
                        .uri(GEMINI_BASE_URL + "/" + fileName + "?key=" + apiKey)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block(Duration.ofSeconds(10));

                if (resp != null) {
                    JsonNode fileNode = objectMapper.readTree(resp);
                    String state = fileNode.path("state").asText();
                    log.debug("파일 상태: {} ({}번째 폴링)", state, i + 1);
                    if ("ACTIVE".equals(state)) {
                        log.info("[TIMING] ACTIVE 확인 완료 ({}번째 폴링)", i + 1);
                        return;
                    }
                    if ("FAILED".equals(state)) {
                        log.warn("Gemini 파일 처리 실패 상태 — 처리를 계속합니다.");
                        return;
                    }
                }

                long sleepMs = (i < 10) ? 500 : 2000;
                Thread.sleep(sleepMs);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                log.warn("파일 상태 확인 실패 ({}회 시도): {}", i + 1, e.getMessage());
                try { Thread.sleep(1000); } catch (InterruptedException ie2) { Thread.currentThread().interrupt(); return; }
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
        String company = (targetCompany != null && !targetCompany.isBlank()) ? targetCompany : "지원 기업";
        String job = (targetJob != null && !targetJob.isBlank()) ? targetJob : "지원 직무";
        String prompt = String.format(
                "%s\n\n" +
                "지원자는 %s의 %s 직무에 지원했습니다.\n" +
                "위 영상은 지원자의 1분 30초 자기소개 영상입니다. " +
                "이 자기소개 내용을 바탕으로 심층 면접 질문 1개를 생성해주세요.\n" +
                "이미 사용한 질문 (중복 금지):\n- %s\n\n" +
                "질문 한 문장만 반환하세요. 다른 텍스트는 포함하지 마세요.",
                interviewerDescription, company, job, prevQuestionsStr);

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
        String coverLetterPart = (coverLetter != null && !coverLetter.isBlank())
                ? "지원자 자기소개서: " + coverLetter + "\n"
                : "";
        String prompt = String.format(
                "%s\n\n" +
                "질문: %s\n" +
                "%s\n" +
                "위 영상에서 지원자의 답변을 분석하여 다음 항목을 0~100점으로 평가하세요.\n\n" +

                "[speechSpeed - 말하기 속도]\n" +
                "발화 속도를 SPM(분당 음절 수)으로 추정하여 평가하세요.\n" +
                "- 이상적: 265~350 SPM / 허용: 250~410 SPM\n" +
                "- 250 미만: 너무 느림 / 410 초과: 너무 빠름 → 감점\n\n" +

                "[fillerWords - 추임새/말더듬]\n" +
                "'음', '어', '그', '저' 등 추임새·말더듬 횟수를 평가하세요.\n" +
                "- 1분 이상: 분당 5회 이하 양호 / 6~11회 주의 / 12회 이상 감점\n" +
                "- 1분 미만: 5초당 1회 이상 감점\n\n" +

                "[eyeContact - 비언어적 태도]\n" +
                "눈맞춤·미소·고개끄덕임·자세를 평가하세요.\n" +
                "중요도 순서: 말하고듣는태도 > 얼굴표정 > 시선처리 > 자세\n\n" +

                "[voiceVolume - 목소리 전달력]\n" +
                "억양 변화폭·음도·강도를 종합 평가하세요.\n" +
                "- 남성: 억양변화 90Hz 이상, 음도 111~130Hz, 강도 67~72dB\n" +
                "- 여성: 억양변화 121Hz 이상, 음도 231~250Hz, 강도 67~72dB\n" +
                "- 강도 55dB 이하 또는 단조로운 억양 → 감점\n\n" +

                "[logicStructure - 논리구조력]\n" +
                "주장-근거-사례 구조 및 결론 비약 여부를 평가하세요.\n\n" +

                "[answerClarity - 답변명확성]\n" +
                "질문 의도 적합성 및 핵심 메시지 전달력을 평가하세요.\n\n" +

                "preamble 없이 순수 JSON만 반환 (마크다운 코드블록 없이):\n" +
                "{\n" +
                "  \"scores\": {\"logicStructure\":점수,\"speechSpeed\":점수,\"voiceVolume\":점수,\"eyeContact\":점수,\"fillerWords\":점수,\"answerClarity\":점수},\n" +
                "  \"overallScore\": 종합점수,\n" +
                "  \"summaryFeedback\": \"한 문장 요약\",\n" +
                "  \"detailFeedback\": {\"logicStructure\":\"피드백\",\"speechSpeed\":\"SPM 수치 포함\",\"voiceVolume\":\"수치 포함\",\"eyeContact\":\"피드백\",\"fillerWords\":\"횟수 포함\",\"answerClarity\":\"피드백\"},\n" +
                "  \"improvementTips\": [\"팁1\",\"팁2\",\"팁3\"]\n" +
                "}",
                interviewerDescription, question, coverLetterPart);

        try {
            long t = System.currentTimeMillis();
            String raw = callGeminiWithVideo(fileUri, mimeType, prompt);
            log.info("[TIMING] generatePeriodFeedback Gemini 호출: {}ms", System.currentTimeMillis() - t);
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
    // 3b. 교시 피드백 + 꼬리질문 단일 호출
    // ───────────────────────────────────────────────

    /**
     * 영상 분석 1번 호출로 교시 피드백 JSON과 꼬리질문 5개를 함께 반환한다.
     */
    public PeriodAnalysisResult generatePeriodAnalysis(String fileUri,
                                                        String mimeType,
                                                        String question,
                                                        InterviewerType interviewerType,
                                                        String coverLetter) {
        String interviewerDescription = getInterviewerDescription(interviewerType);
        String coverLetterPart = (coverLetter != null && !coverLetter.isBlank())
                ? "지원자 자기소개서: " + coverLetter + "\n"
                : "";
        String prompt = String.format(
                "%s\n\n" +
                "질문: %s\n" +
                "%s\n" +
                "위 영상에서 지원자의 답변을 분석하여 다음 항목을 0~100점으로 평가하세요.\n\n" +

                "[speechSpeed - 말하기 속도]\n" +
                "발화 속도를 SPM(분당 음절 수)으로 추정하여 평가하세요.\n" +
                "- 이상적: 265~350 SPM / 허용: 250~410 SPM\n" +
                "- 250 미만: 너무 느림 / 410 초과: 너무 빠름 → 감점\n\n" +

                "[fillerWords - 추임새/말더듬]\n" +
                "'음', '어', '그', '저' 등 추임새·말더듬 횟수를 평가하세요.\n" +
                "- 1분 이상: 분당 5회 이하 양호 / 6~11회 주의 / 12회 이상 감점\n" +
                "- 1분 미만: 5초당 1회 이상 감점\n\n" +

                "[eyeContact - 비언어적 태도]\n" +
                "눈맞춤·미소·고개끄덕임·자세를 평가하세요.\n" +
                "중요도 순서: 말하고듣는태도 > 얼굴표정 > 시선처리 > 자세\n\n" +

                "[voiceVolume - 목소리 전달력]\n" +
                "억양 변화폭·음도·강도를 종합 평가하세요.\n" +
                "- 남성: 억양변화 90Hz 이상, 음도 111~130Hz, 강도 67~72dB\n" +
                "- 여성: 억양변화 121Hz 이상, 음도 231~250Hz, 강도 67~72dB\n" +
                "- 강도 55dB 이하 또는 단조로운 억양 → 감점\n\n" +

                "[logicStructure - 논리구조력]\n" +
                "주장-근거-사례 구조 및 결론 비약 여부를 평가하세요.\n\n" +

                "[answerClarity - 답변명확성]\n" +
                "질문 의도 적합성 및 핵심 메시지 전달력을 평가하세요.\n\n" +

                "또한 이 질문에 자연스럽게 이어질 꼬리질문 5개를 생성하세요.\n\n" +

                "[출력 예시 — 아래 형식을 반드시 준수하세요]\n" +
                "{\n" +
                "  \"feedback\": {\n" +
                "    \"scores\": {\"logicStructure\":72,\"speechSpeed\":65,\"voiceVolume\":78,\"eyeContact\":80,\"fillerWords\":60,\"answerClarity\":75},\n" +
                "    \"overallScore\": 72,\n" +
                "    \"summaryFeedback\": \"논리적 흐름은 양호하나 말하기 속도가 다소 빠르고 추임새가 자주 나타났어요.\",\n" +
                "    \"detailFeedback\": {\"logicStructure\":\"STAR 구조로 답변했으며 근거가 명확했어요.\",\"speechSpeed\":\"약 380 SPM으로 다소 빠른 편이에요.\",\"voiceVolume\":\"적절한 억양 변화를 보였어요.\",\"eyeContact\":\"카메라 시선 처리가 자연스러웠어요.\",\"fillerWords\":\"분당 약 8회 추임새가 나타났어요.\",\"answerClarity\":\"질문 의도에 맞게 핵심을 전달했어요.\"},\n" +
                "    \"improvementTips\": [\"말하기 속도를 의식적으로 늦춰보세요.\",\"추임새 대신 짧은 침묵으로 생각 시간을 가져보세요.\",\"두괄식 구조로 결론을 먼저 말해보세요.\"]\n" +
                "  },\n" +
                "  \"followUpQuestions\": [\"그 경험에서 본인이 맡은 구체적인 역할은 무엇이었나요?\",\"그 과정에서 가장 어려웠던 점은 무엇인가요?\",\"그 결과로 팀에 어떤 영향이 있었나요?\",\"비슷한 상황이 또 생긴다면 어떻게 다르게 접근하시겠나요?\",\"그 경험을 통해 배운 점을 현재 직무에 어떻게 적용하고 있나요?\"]\n" +
                "}\n\n" +
                "실제 분석 결과를 위 형식으로 preamble 없이 순수 JSON만 반환 (마크다운 코드블록 없이):",
                interviewerDescription, question, coverLetterPart);

        int maxSchemaAttempts = 2;
        for (int schemaAttempt = 1; schemaAttempt <= maxSchemaAttempts; schemaAttempt++) {
            try {
                long t = System.currentTimeMillis();
                String raw = callGeminiWithVideo(fileUri, mimeType, prompt);
                log.info("[TIMING] generatePeriodAnalysis Gemini 호출 (시도 {}): {}ms", schemaAttempt, System.currentTimeMillis() - t);
                String combinedJson = extractJson(raw);

                validatePeriodAnalysisJson(combinedJson);

                JsonNode root = objectMapper.readTree(combinedJson);
                String feedbackJson = objectMapper.writeValueAsString(root.path("feedback"));

                List<String> followUpQuestions = new ArrayList<>();
                JsonNode questionsNode = root.path("followUpQuestions");
                if (questionsNode.isArray()) {
                    questionsNode.forEach(q -> followUpQuestions.add(q.asText()));
                }
                if (followUpQuestions.isEmpty()) {
                    followUpQuestions.addAll(defaultFollowUpQuestions());
                }
                return new PeriodAnalysisResult(feedbackJson, followUpQuestions);

            } catch (Exception e) {
                if (schemaAttempt == maxSchemaAttempts) {
                    log.warn("Gemini 피드백+꼬리질문 생성 최종 실패 — fallback 사용: {}", e.getMessage());
                } else {
                    log.warn("Gemini JSON 스키마 검증 실패 — 재시도 ({}/{}): {}", schemaAttempt, maxSchemaAttempts, e.getMessage());
                }
            }
        }
        String feedbackJson = "{\"scores\":{\"logicStructure\":70,\"speechSpeed\":70,\"voiceVolume\":70,\"eyeContact\":70,\"fillerWords\":70,\"answerClarity\":70}," +
                "\"overallScore\":70,\"summaryFeedback\":\"AI 분석을 일시적으로 사용할 수 없습니다. 답변을 잘 하셨습니다.\"," +
                "\"detailFeedback\":{\"logicStructure\":\"분석 불가\",\"speechSpeed\":\"분석 불가\",\"voiceVolume\":\"분석 불가\",\"eyeContact\":\"분석 불가\",\"fillerWords\":\"분석 불가\",\"answerClarity\":\"분석 불가\"}," +
                "\"improvementTips\":[\"다음 답변에서도 자신감 있게 말해보세요.\",\"핵심을 먼저 말하는 두괄식 구조를 활용해 보세요.\",\"구체적인 사례를 들어 답변을 풍부하게 만들어 보세요.\"]}";
        return new PeriodAnalysisResult(feedbackJson, defaultFollowUpQuestions());
    }

    private List<String> defaultFollowUpQuestions() {
        return new ArrayList<>(List.of(
            "이전 답변에서 더 자세히 설명해 주실 수 있나요?",
            "그렇게 생각하신 근거가 있나요?",
            "구체적인 사례를 들어 주실 수 있나요?",
            "다른 방법은 고려해 보셨나요?",
            "그 경험에서 무엇을 배우셨나요?"
        ));
    }

    // ───────────────────────────────────────────────
    // 4. 꼬리질문 생성
    // ───────────────────────────────────────────────

    /**
     * 이전 질문을 바탕으로 꼬리질문 5개를 생성한다 (텍스트 기반).
     */
    public List<String> generateFollowUpQuestions(String fileUri, String mimeType, String prevQuestion) {
        String prompt = String.format(
                "면접 질문에 자연스럽게 이어질 수 있는 꼬리질문 5개를 생성해주세요.\n" +
                "이전 질문: %s\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\"questions\": [\"질문1\", \"질문2\", \"질문3\", \"질문4\", \"질문5\"]}",
                prevQuestion);

        String raw;
        try {
            long t = System.currentTimeMillis();
            raw = callGeminiText(prompt);
            log.info("[TIMING] generateFollowUpQuestions Gemini 호출: {}ms", System.currentTimeMillis() - t);
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

    // 랜덤 질문 다양성을 위한 토픽 풀 (호출마다 다른 토픽 선택)
    private static final List<String> QUESTION_TOPICS = List.of(
        "성장 경험과 자기개발",
        "실패·갈등 극복과 회복탄력성",
        "리더십·팔로워십 경험",
        "데이터·수치 기반 의사결정 경험",
        "고객·사용자 중심 사고",
        "창의적 문제 해결 경험",
        "협업·커뮤니케이션 스타일",
        "목표 설정과 우선순위 관리",
        "변화·불확실성 대응 경험",
        "직무 전문성과 최신 트렌드 인식"
    );

    /**
     * 이전 질문들과 겹치지 않는 새로운 회사/직무 관련 질문을 생성한다.
     */
    public String generateNewQuestion(String coverLetter,
                                      String targetCompany,
                                      String targetJob,
                                      List<String> previousQuestions) {
        return generateNewQuestion(coverLetter, targetCompany, targetJob, previousQuestions, null, null);
    }

    public String generateNewQuestion(String coverLetter,
                                      String targetCompany,
                                      String targetJob,
                                      List<String> previousQuestions,
                                      String introContext) {
        return generateNewQuestion(coverLetter, targetCompany, targetJob, previousQuestions, introContext, null);
    }

    public String generateNewQuestion(String coverLetter,
                                      String targetCompany,
                                      String targetJob,
                                      List<String> previousQuestions,
                                      String introContext,
                                      String currentQuestion) {
        String prevQuestionsStr = previousQuestions.isEmpty() ? "없음" : "- " + String.join("\n- ", previousQuestions);
        String tc = (targetCompany != null && !targetCompany.isBlank()) ? targetCompany : "지원 기업";
        String tj = (targetJob != null && !targetJob.isBlank()) ? targetJob : "지원 직무";

        // 호출마다 다른 토픽 선택 (현재 시각 기반 → 반복 방지)
        int topicIdx = (int) (System.currentTimeMillis() % QUESTION_TOPICS.size());
        String chosenTopic = QUESTION_TOPICS.get(topicIdx);

        String contextPart = "";
        if (introContext != null && !introContext.isBlank())
            contextPart += "지원자 자기소개 요약: " + introContext + "\n";
        if (currentQuestion != null && !currentQuestion.isBlank())
            contextPart += "방금 답변한 질문: " + currentQuestion + "\n";

        String prompt = String.format(
                "%s\n" +
                "%s 회사의 %s 직무 면접 질문 1개를 생성하세요.\n\n" +
                "반드시 다음 조건을 모두 충족하세요:\n" +
                "1. 이번 질문의 핵심 주제: [%s] — 이 주제를 중심으로 질문을 만드세요.\n" +
                "2. 이미 사용한 질문과 주제가 중복되지 않아야 합니다:\n%s\n" +
                "3. 방금 답변한 질문과는 완전히 다른 각도의 질문이어야 합니다.\n" +
                "4. 구체적인 경험이나 사례를 유도하는 행동 기반 질문으로 작성하세요.\n\n" +
                "질문 한 문장만 반환하세요. 번호·설명·인사말 없이 질문 그대로만.",
                contextPart, tc, tj, chosenTopic, prevQuestionsStr);

        try {
            return callGeminiText(prompt).trim();
        } catch (Exception e) {
            log.warn("Gemini 새 질문 생성 실패 — 기본 질문 사용: {}", e.getMessage());
            List<String> fallbackQuestions = List.of(
                "실패했던 경험과 그로부터 배운 점을 말씀해 주세요.",
                "팀에서 의견 충돌이 있었을 때 어떻게 해결하셨나요?",
                "스스로 세운 목표를 달성하기 위해 어떤 노력을 기울였나요?",
                "업무 중 예상치 못한 변화에 어떻게 대응하셨나요?",
                "가장 창의적으로 문제를 해결했던 경험을 말씀해 주세요.",
                "리더 역할을 맡았던 경험과 그 결과를 말씀해 주세요.",
                "데이터나 수치를 활용해 의사결정한 경험이 있으신가요?",
                "본인의 커뮤니케이션 스타일을 사례와 함께 설명해 주세요."
            );
            return fallbackQuestions.stream()
                .filter(q -> !previousQuestions.contains(q))
                .findFirst()
                .orElse("본인이 이 직무에 적합한 이유를 구체적인 경험으로 말씀해 주세요.");
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
                "- strongPoints, weakPoints, improvementPoints 각 항목은 30자 이내로 간결하게 작성하세요.\n" +
                "- overallSummary는 100자 이내로 작성하세요.\n" +
                "- competencyShortDescriptions의 각 설명은 15자 이내의 짧은 문장으로 작성하세요.\n" +
                "  예시: '근거가 부족해요.', '말하기 속도가 빨라요.', '추임새가 잦아요.', '눈맞춤이 부족해요.'\n\n" +
                "preamble 없이 순수 JSON만 반환하세요 (마크다운 코드블록 없이):\n" +
                "{\n" +
                "  \"totalScore\": 종합점수,\n" +
                "  \"periodScores\": [교시1점수, 교시2점수, ...],\n" +
                "  \"strongPoints\": [\"강점1\", \"강점2\", \"강점3\"],\n" +
                "  \"weakPoints\": [\"아쉬운점1\", \"아쉬운점2\"],\n" +
                "  \"improvementPoints\": [\"개선점1\", \"개선점2\", \"개선점3\"],\n" +
                "  \"overallSummary\": \"전체 요약\",\n" +
                "  \"competencyShortDescriptions\": {\n" +
                "    \"logicStructure\": \"논리 구조 관련 짧은 설명\",\n" +
                "    \"speechSpeed\": \"말하기 속도 관련 짧은 설명\",\n" +
                "    \"voiceVolume\": \"목소리 관련 짧은 설명\",\n" +
                "    \"eyeContact\": \"비언어 표현 관련 짧은 설명\",\n" +
                "    \"fillerWords\": \"추임새 관련 짧은 설명\",\n" +
                "    \"answerClarity\": \"답변 명확성 관련 짧은 설명\"\n" +
                "  }\n" +
                "}",
                feedbackList);

        try {
            String raw = callGeminiText(prompt);
            return extractJson(raw);
        } catch (Exception e) {
            log.warn("Gemini 최종 피드백 생성 실패 — 기본 피드백 사용: {}", e.getMessage());
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
                "\"weakPoints\":[\"일부 답변에서 핵심이 다소 흐려졌어요.\"]," +
                "\"improvementPoints\":[\"답변을 더 구체적으로 준비해 보세요.\",\"핵심 메시지를 먼저 전달하는 연습을 해보세요.\"]," +
                "\"overallSummary\":\"AI 분석을 일시적으로 사용할 수 없습니다. 면접에 성실히 임해주셔서 감사합니다.\"," +
                "\"competencyShortDescriptions\":{\"logicStructure\":\"분석 중이에요.\",\"speechSpeed\":\"분석 중이에요.\",\"voiceVolume\":\"분석 중이에요.\",\"eyeContact\":\"분석 중이에요.\",\"fillerWords\":\"분석 중이에요.\",\"answerClarity\":\"분석 중이에요.\"}}",
                avg, scoresJson);
        }
    }

    // ───────────────────────────────────────────────
    // Private helpers — Google GenAI SDK 호출
    // ───────────────────────────────────────────────

    /**
     * 텍스트만으로 Gemini 호출. 429/503 시 최대 3회 재시도.
     */
    private String callGeminiText(String prompt) {
        int maxAttempts = 4;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                GenerateContentResponse response = geminiClient.models.generateContent(
                        GEMINI_MODEL, prompt, (GenerateContentConfig) null);
                String text = response.text();
                if (text == null || text.isBlank()) throw new RuntimeException("Gemini 응답 텍스트가 비어 있습니다.");
                return text;
            } catch (ApiException e) {
                int status = e.code();
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean retryable = (status == 503) ||
                        (status == 429 && !msg.contains("RESOURCE_EXHAUSTED") && !msg.contains("spending cap"));
                if (!retryable || attempt == maxAttempts) {
                    log.error("Gemini 텍스트 호출 최종 실패 (HTTP {}): {}", status, msg);
                    throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
                }
                log.warn("Gemini {} — 재시도 ({}/{})", status, attempt, maxAttempts - 1);
                sleepForRetry(attempt);
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    log.error("Gemini 텍스트 호출 실패: {}", e.getMessage());
                    throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
                }
                log.warn("Gemini 호출 오류 — 재시도 ({}/{}): {}", attempt, maxAttempts - 1, e.getMessage());
                sleepForRetry(attempt);
            }
        }
        throw new RuntimeException("Gemini API 호출에 실패했습니다.");
    }

    /**
     * 영상 fileUri를 포함하여 Gemini 호출. 429/503 시 최대 3회 재시도.
     */
    private String callGeminiWithVideo(String fileUri, String mimeType, String prompt) {
        int maxAttempts = 4;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                Content content = Content.fromParts(
                        Part.fromUri(fileUri, mimeType),
                        Part.builder().text(prompt).build()
                );
                GenerateContentResponse response = geminiClient.models.generateContent(
                        GEMINI_MODEL, content, (GenerateContentConfig) null);
                String text = response.text();
                if (text == null || text.isBlank()) throw new RuntimeException("Gemini 응답 텍스트가 비어 있습니다.");
                return text;
            } catch (ApiException e) {
                int status = e.code();
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean retryable = (status == 503) ||
                        (status == 429 && !msg.contains("RESOURCE_EXHAUSTED") && !msg.contains("spending cap"));
                if (!retryable || attempt == maxAttempts) {
                    log.error("Gemini 영상 포함 호출 최종 실패 (HTTP {}): {}", status, msg);
                    throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
                }
                log.warn("Gemini {} — 재시도 ({}/{})", status, attempt, maxAttempts - 1);
                sleepForRetry(attempt);
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    log.error("Gemini 영상 포함 호출 실패: {}", e.getMessage());
                    throw new RuntimeException("Gemini API 호출에 실패했습니다.", e);
                }
                log.warn("Gemini 호출 오류 — 재시도 ({}/{}): {}", attempt, maxAttempts - 1, e.getMessage());
                sleepForRetry(attempt);
            }
        }
        throw new RuntimeException("Gemini API 호출에 실패했습니다.");
    }

    private void sleepForRetry(int attempt) {
        try {
            Thread.sleep(Math.min(2000L * attempt, 10000L));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    // ───────────────────────────────────────────────
    // JSON 스키마 검증
    // ───────────────────────────────────────────────

    /**
     * generatePeriodAnalysis 결합 JSON의 필수 스키마를 검증한다.
     * 누락 필드가 있거나 타입이 맞지 않으면 IllegalStateException을 던진다.
     */
    private void validatePeriodAnalysisJson(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);

        JsonNode feedback = root.path("feedback");
        if (feedback.isMissingNode() || feedback.isNull()) {
            throw new IllegalStateException("JSON 스키마 오류: 'feedback' 필드가 없습니다.");
        }

        JsonNode scores = feedback.path("scores");
        for (String key : COMPETENCY_KEYS) {
            JsonNode val = scores.path(key);
            if (val.isMissingNode() || !val.isNumber()) {
                throw new IllegalStateException("JSON 스키마 오류: scores." + key + " 누락 또는 숫자 아님");
            }
        }

        if (!feedback.path("overallScore").isNumber()) {
            throw new IllegalStateException("JSON 스키마 오류: 'overallScore' 누락 또는 숫자 아님");
        }

        String summary = feedback.path("summaryFeedback").asText("");
        if (summary.isBlank()) {
            throw new IllegalStateException("JSON 스키마 오류: 'summaryFeedback' 비어 있음");
        }

        JsonNode detailFeedback = feedback.path("detailFeedback");
        for (String key : COMPETENCY_KEYS) {
            if (detailFeedback.path(key).asText("").isBlank()) {
                throw new IllegalStateException("JSON 스키마 오류: detailFeedback." + key + " 비어 있음");
            }
        }

        JsonNode tips = feedback.path("improvementTips");
        if (!tips.isArray() || tips.isEmpty()) {
            throw new IllegalStateException("JSON 스키마 오류: 'improvementTips' 배열이 비어 있음");
        }

        JsonNode followUpQuestions = root.path("followUpQuestions");
        if (!followUpQuestions.isArray() || followUpQuestions.isEmpty()) {
            throw new IllegalStateException("JSON 스키마 오류: 'followUpQuestions' 배열이 비어 있음");
        }
    }

    // ───────────────────────────────────────────────
    // One Point 코칭 메시지 생성
    // ───────────────────────────────────────────────

    /**
     * 최근 3회 면접에서 가장 낮았던 역량 키를 받아 집중 코칭 메시지를 생성한다.
     */
    public String generateOnePointCoaching(String weakestCompetencyKey, String targetJob) {
        String koName = COMPETENCY_KO.getOrDefault(weakestCompetencyKey, weakestCompetencyKey);
        String job = (targetJob != null && !targetJob.isBlank()) ? targetJob : "지원 직무";
        String prompt = String.format(
                "당신은 취업 면접 전문 코치입니다.\n" +
                "지원자의 최근 3회 '%s' 면접 데이터를 분석한 결과, '%s(%s)' 역량이 지속적으로 가장 낮게 나타났습니다.\n\n" +
                "이 역량을 집중 개선할 수 있는 One Point 코칭 메시지를 작성해주세요.\n" +
                "조건: 실천 가능한 구체적 방법 1가지, 50자 이내, 격려하는 어조.\n\n" +
                "코칭 메시지 한 문장만 반환하세요.",
                job, koName, weakestCompetencyKey);

        try {
            return callGeminiText(prompt).trim();
        } catch (Exception e) {
            log.warn("One Point 코칭 생성 실패 — 기본 메시지 사용: {}", e.getMessage());
            return koName + " 역량을 집중적으로 연습하면 빠르게 향상될 수 있어요. 화이팅!";
        }
    }

    /**
     * 텍스트에서 JSON 블록만 추출한다.
     * Gemini가 마크다운 코드블록(```json ... ```)으로 감싸는 경우를 처리한다.
     */
    String extractJson(String text) {
        if (text == null || text.isBlank()) return "{}";

        Pattern codeBlock = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");
        Matcher matcher = codeBlock.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

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

package com.readyq.service;

import com.readyq.dto.interview.*;
import com.readyq.model.interview.*;
import com.readyq.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final GeminiInterviewService geminiService;
    @Value("${interview.video.upload.path:./uploads/interview-videos}")
    private String uploadBasePath;

    // ───────────────────────────────────────────────
    // 1. 면접 시작 - 세션 생성 + 1교시 질문 반환
    // ───────────────────────────────────────────────

    public StartInterviewResponse startInterview(String userId, StartInterviewRequest request) {
        InterviewerType interviewerType;
        try {
            interviewerType = InterviewerType.valueOf(request.getInterviewerType().toUpperCase());
        } catch (IllegalArgumentException e) {
            interviewerType = InterviewerType.DEFAULT;
        }

        // 1교시 고정 질문
        String firstQuestion = geminiService.generateInitialQuestion(
                null,
                request.getTargetCompany(),
                request.getTargetJob(),
                interviewerType
        );

        PeriodResult firstPeriod = PeriodResult.builder()
                .periodNum(1)
                .question(firstQuestion)
                .questionType(QuestionType.INTRO)
                .build();

        InterviewSession session = InterviewSession.builder()
                .userId(userId)
                .title(request.getTitle())
                .interviewerType(interviewerType)
                .status(InterviewStatus.IN_PROGRESS)
                .targetCompany(request.getTargetCompany())
                .targetJob(request.getTargetJob())
                .currentPeriod(1)
                .periods(new ArrayList<>(List.of(firstPeriod)))
                .createdAt(LocalDateTime.now())
                .build();

        InterviewSession saved = sessionRepository.save(session);

        return StartInterviewResponse.builder()
                .sessionId(saved.getId())
                .periodNum(1)
                .question(firstQuestion)
                .interviewerType(interviewerType.name())
                .message("1교시를 시작합니다!")
                .build();
    }

    // ───────────────────────────────────────────────
    // 2a. 영상 업로드 → 로컬 저장 + Gemini File API 업로드
    // ───────────────────────────────────────────────

    public void uploadPeriodVideo(String userId,
                                  String sessionId,
                                  int periodNum,
                                  MultipartFile video) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        PeriodResult periodResult = getPeriodResult(session, periodNum);

        long t0 = System.currentTimeMillis();
        String videoPath = saveVideoLocally(video, userId, sessionId, periodNum);
        periodResult.setVideoPath(videoPath);
        log.info("[TIMING] {}교시 영상 로컬 저장: {}ms", periodNum, System.currentTimeMillis() - t0);

        long t1 = System.currentTimeMillis();
        GeminiInterviewService.GeminiFileRef fileRef = geminiService.uploadVideoToGemini(video);
        log.info("[TIMING] {}교시 Gemini 업로드+ACTIVE 대기: {}ms", periodNum, System.currentTimeMillis() - t1);

        periodResult.setGeminiFileUri(fileRef.uri());
        periodResult.setGeminiMimeType(fileRef.mimeType());

        sessionRepository.save(session);
    }

    // ───────────────────────────────────────────────
    // 2b. 피드백 생성 → Gemini 분석 + 쉬는시간 응답
    // ───────────────────────────────────────────────

    public BreakTimeResponse submitPeriodAnswer(String userId,
                                                String sessionId,
                                                int periodNum) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        PeriodResult periodResult = getPeriodResult(session, periodNum);

        String geminiUri = periodResult.getGeminiFileUri();
        String geminiMimeType = periodResult.getGeminiMimeType();

        if (geminiUri == null) {
            throw new IllegalStateException("영상이 아직 업로드되지 않았습니다. 먼저 /upload 를 호출하세요.");
        }

        // 병렬 실행에 필요한 값 미리 확보 (람다에서 final 참조)
        final String currentQuestion   = periodResult.getQuestion();
        final InterviewerType iType    = session.getInterviewerType();
        final String targetCompany     = session.getTargetCompany();
        final String targetJob         = session.getTargetJob();
        final List<String> allPrevQuestions = session.getPeriods().stream()
                .map(PeriodResult::getQuestion).collect(Collectors.toList());
        // 현재 교시 이전까지 완료된 Q&A 전사본
        final List<String> prevQnA = session.getPeriods().stream()
                .filter(p -> p.getPeriodNum() < periodNum && p.getTranscript() != null && !p.getTranscript().isBlank())
                .map(p -> "Q" + p.getPeriodNum() + ": " + p.getQuestion() + "\nA: " + p.getTranscript())
                .collect(Collectors.toList());

        log.info("{}교시 피드백 생성 시작. sessionId={}", periodNum, sessionId);
        long t = System.currentTimeMillis();

        // 피드백 생성(영상 분석)
        CompletableFuture<GeminiInterviewService.PeriodAnalysisResult> feedbackFuture =
                CompletableFuture.supplyAsync(() ->
                        geminiService.generatePeriodAnalysis(geminiUri, geminiMimeType,
                                currentQuestion, iType, null));

        // STT 전사 → 완료 즉시 새 질문 생성 시작 (체이닝)
        CompletableFuture<String> transcriptFuture =
                CompletableFuture.supplyAsync(() ->
                        geminiService.extractTranscript(geminiUri, geminiMimeType));

        CompletableFuture<String> newQuestionFuture = transcriptFuture
                .thenApplyAsync(transcript -> {
                    List<String> fullQnA = new ArrayList<>(prevQnA);
                    if (transcript != null && !transcript.isBlank()) {
                        fullQnA.add("Q" + periodNum + ": " + currentQuestion + "\nA: " + transcript);
                    }
                    return geminiService.generateNewQuestion(null, targetCompany, targetJob,
                            allPrevQuestions, null, null, iType, fullQnA);
                })
                .exceptionally(e -> {
                    log.warn("새 질문 사전 생성 실패: {}", e.getMessage());
                    return null;
                });

        GeminiInterviewService.PeriodAnalysisResult analysis;
        String transcript;
        String pregenQuestion;
        try {
            analysis      = feedbackFuture.get(300, TimeUnit.SECONDS);
            transcript    = transcriptFuture.getNow(null);
            pregenQuestion = newQuestionFuture.get(90, TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException e) {
            analysis      = feedbackFuture.getNow(null);
            transcript    = transcriptFuture.getNow(null);
            pregenQuestion = newQuestionFuture.getNow(null);
            if (analysis == null) throw new RuntimeException("피드백 생성 타임아웃", e);
        } catch (Exception e) {
            throw new RuntimeException("분석 중 오류: " + e.getMessage(), e);
        }
        log.info("[TIMING] {}교시 피드백+STT+새질문 생성: {}ms", periodNum, System.currentTimeMillis() - t);

        PeriodFeedback parsedFeedback = geminiService.parsePeriodFeedback(analysis.feedbackJson());

        periodResult.setFeedbackJson(analysis.feedbackJson());
        periodResult.setParsedFeedback(parsedFeedback);
        periodResult.setFollowUpQuestions(analysis.followUpQuestions());
        periodResult.setTranscript(transcript);
        periodResult.setPreGeneratedNewQuestion(pregenQuestion);
        periodResult.setCompletedAt(LocalDateTime.now());

        sessionRepository.save(session);

        BreakTimeResponse.PeriodFeedbackSummary summary =
                BreakTimeResponse.PeriodFeedbackSummary.builder()
                        .overallScore(parsedFeedback.getOverallScore())
                        .summaryFeedback(parsedFeedback.getSummaryFeedback())
                        .build();

        return BreakTimeResponse.builder()
                .sessionId(sessionId)
                .completedPeriodNum(periodNum)
                .periodFeedbackSummary(summary)
                .canContinue(true)
                .message("쉬는 시간입니다! 다음을 선택하세요.")
                .build();
    }

    // ───────────────────────────────────────────────
    // 3. 쉬는시간 선택지 반환 (꼬리질문 5개 + 새질문 + 종료)
    // ───────────────────────────────────────────────

    public NextPeriodOptions getNextOptions(String userId, String sessionId, int periodNum) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        PeriodResult periodResult = getPeriodResult(session, periodNum);

        List<String> followUpQuestions = periodResult.getFollowUpQuestions();
        if (followUpQuestions == null) followUpQuestions = new ArrayList<>();

        return NextPeriodOptions.builder()
                .sessionId(sessionId)
                .currentPeriod(periodNum)
                .followUpQuestions(followUpQuestions)
                .newQuestionAvailable(true)
                .canEndInterview(true)
                .build();
    }

    // ───────────────────────────────────────────────
    // 4. 다음 교시 진행
    // ───────────────────────────────────────────────

    public NextPeriodResponse proceedToNextPeriod(String userId,
                                                   String sessionId,
                                                   int currentPeriodNum,
                                                   NextPeriodRequest request) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);

        if ("END_INTERVIEW".equalsIgnoreCase(request.getChoiceType())) {
            // 면접 종료 선택 시 complete 엔드포인트 호출 유도
            return NextPeriodResponse.builder()
                    .sessionId(sessionId)
                    .periodNum(currentPeriodNum)
                    .question(null)
                    .questionType("END_INTERVIEW")
                    .message("면접이 종료됩니다. /complete 를 호출하여 최종 피드백을 받으세요.")
                    .build();
        }

        int nextPeriodNum = currentPeriodNum + 1;
        String nextQuestion;
        QuestionType questionType;

        if ("FOLLOW_UP".equalsIgnoreCase(request.getChoiceType())) {
            nextQuestion = request.getSelectedQuestion();
            if (nextQuestion == null || nextQuestion.isBlank()) {
                throw new IllegalArgumentException("꼬리질문 선택 시 selectedQuestion은 필수입니다.");
            }
            questionType = QuestionType.FOLLOW_UP;

        } else if ("NEW_QUESTION".equalsIgnoreCase(request.getChoiceType())) {
            String pregen = getPeriodResult(session, currentPeriodNum).getPreGeneratedNewQuestion();
            if (pregen != null && !pregen.isBlank()) {
                nextQuestion = pregen;
                log.info("사전 생성된 NEW_QUESTION 반환. period={}", currentPeriodNum);
            } else {
                // 사전 생성 실패 시 fallback: 전체 Q&A 전사본으로 즉시 생성
                List<String> previousQuestions = session.getPeriods().stream()
                        .map(PeriodResult::getQuestion).collect(Collectors.toList());
                List<String> allQnA = session.getPeriods().stream()
                        .filter(p -> p.getTranscript() != null && !p.getTranscript().isBlank())
                        .map(p -> "Q" + p.getPeriodNum() + ": " + p.getQuestion() + "\nA: " + p.getTranscript())
                        .collect(Collectors.toList());
                log.warn("사전 생성 없음 — fallback 즉시 생성. period={}", currentPeriodNum);
                nextQuestion = geminiService.generateNewQuestion(
                        null, session.getTargetCompany(), session.getTargetJob(),
                        previousQuestions, null, null, session.getInterviewerType(), allQnA);
            }
            questionType = QuestionType.NEW;

        } else {
            throw new IllegalArgumentException("지원하지 않는 choiceType: " + request.getChoiceType());
        }

        PeriodResult nextPeriod = PeriodResult.builder()
                .periodNum(nextPeriodNum)
                .question(nextQuestion)
                .questionType(questionType)
                .build();

        session.getPeriods().add(nextPeriod);
        session.setCurrentPeriod(nextPeriodNum);
        sessionRepository.save(session);

        return NextPeriodResponse.builder()
                .sessionId(sessionId)
                .periodNum(nextPeriodNum)
                .question(nextQuestion)
                .questionType(questionType.name())
                .message(nextPeriodNum + "교시를 시작합니다!")
                .build();
    }

    // ───────────────────────────────────────────────
    // 5. 면접 종료 + 최종 피드백 생성
    // ───────────────────────────────────────────────

    public FinalFeedbackResponse completeInterview(String userId, String sessionId) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);

        if (session.getStatus() == InterviewStatus.COMPLETED) {
            // 이미 완료된 경우 저장된 최종 피드백 반환
            return buildFinalFeedbackResponse(session);
        }

        // 완료된 교시 피드백 JSON 목록 수집
        List<String> feedbackJsonList = session.getPeriods().stream()
                .filter(p -> p.getFeedbackJson() != null)
                .map(PeriodResult::getFeedbackJson)
                .collect(Collectors.toList());

        if (feedbackJsonList.isEmpty()) {
            throw new IllegalStateException("제출된 영상이 없어 최종 피드백을 생성할 수 없습니다.");
        }

        String finalFeedbackJson = geminiService.generateFinalFeedback(feedbackJsonList);
        FinalFeedback finalFeedback = geminiService.parseFinalFeedback(finalFeedbackJson);

        // 역량별 평균 점수 계산
        List<PeriodFeedback> completedFeedbacks = session.getPeriods().stream()
                .filter(p -> p.getParsedFeedback() != null)
                .map(PeriodResult::getParsedFeedback)
                .collect(Collectors.toList());
        finalFeedback.setCompetencyScores(computeAverageCompetencyScores(completedFeedbacks));

        // 이전/첫 면접 점수 비교
        enrichSessionComparisons(userId, sessionId, finalFeedback);

        // 최근 3회 면접 중 가장 낮았던 역량 → One Point 코칭
        enrichOnePointCoaching(userId, sessionId, session, finalFeedback);

        session.setFinalFeedback(finalFeedback);
        session.setStatus(InterviewStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // 영상은 3일 후 VideoCleanupService가 일괄 삭제 (즉시 삭제 안 함)

        return buildFinalFeedbackResponse(session);
    }

    // ───────────────────────────────────────────────
    // 6. 과거 면접 목록 조회 (고정 우선, 최신순)
    // ───────────────────────────────────────────────

    public List<InterviewSession> getInterviewHistory(String userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .sorted((a, b) -> {
                    if (a.isPinned() == b.isPinned()) return 0;
                    return a.isPinned() ? -1 : 1;
                })
                .collect(Collectors.toList());
    }

    // ───────────────────────────────────────────────
    // 6a. 면접 세션 삭제
    // ───────────────────────────────────────────────

    public void deleteSession(String userId, String sessionId) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        deleteSessionVideos(userId, sessionId);
        sessionRepository.delete(session);
        log.info("면접 세션 삭제 완료. userId={}, sessionId={}", userId, sessionId);
    }

    // ───────────────────────────────────────────────
    // 6b. 제목 수정
    // ───────────────────────────────────────────────

    public void renameSession(String userId, String sessionId, String newTitle) {
        if (newTitle == null || newTitle.isBlank()) {
            throw new IllegalArgumentException("제목은 비워둘 수 없습니다.");
        }
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        session.setTitle(newTitle.trim());
        sessionRepository.save(session);
    }

    // ───────────────────────────────────────────────
    // 6c. 고정 / 해제 토글
    // ───────────────────────────────────────────────

    public boolean togglePin(String userId, String sessionId) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        session.setPinned(!session.isPinned());
        sessionRepository.save(session);
        log.info("고정 토글. sessionId={}, pinned={}", sessionId, session.isPinned());
        return session.isPinned();
    }

    // ───────────────────────────────────────────────
    // 7. 특정 세션 최종 피드백 조회
    // ───────────────────────────────────────────────

    public FinalFeedbackResponse getSessionFeedback(String userId, String sessionId) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);

        if (session.getStatus() != InterviewStatus.COMPLETED || session.getFinalFeedback() == null) {
            throw new IllegalStateException("아직 완료되지 않은 면접 세션입니다.");
        }

        return buildFinalFeedbackResponse(session);
    }

    // ───────────────────────────────────────────────
    // 8. 특정 교시 피드백 조회
    // ───────────────────────────────────────────────

    public PeriodFeedback getPeriodFeedback(String userId, String sessionId, int periodNum) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        PeriodResult periodResult = getPeriodResult(session, periodNum);

        if (periodResult.getParsedFeedback() == null) {
            throw new IllegalStateException(periodNum + "교시 피드백이 아직 생성되지 않았습니다.");
        }

        return periodResult.getParsedFeedback();
    }

    // ───────────────────────────────────────────────
    // 9. 아카이브 목록 조회 (완료된 세션만)
    // ───────────────────────────────────────────────

    public List<InterviewSession> getCompletedSessions(String userId) {
        return sessionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, InterviewStatus.COMPLETED);
    }

    // ───────────────────────────────────────────────
    // 10. 아카이브 상세 조회
    // ───────────────────────────────────────────────

    public InterviewSession getSessionDetail(String userId, String sessionId) {
        return getSessionAndValidateOwner(sessionId, userId);
    }

    // ───────────────────────────────────────────────
    // Private helpers
    // ───────────────────────────────────────────────

    private InterviewSession getSessionAndValidateOwner(String sessionId, String userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("면접 세션을 찾을 수 없습니다. id=" + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new SecurityException("해당 세션에 접근할 권한이 없습니다.");
        }

        return session;
    }

    private PeriodResult getPeriodResult(InterviewSession session, int periodNum) {
        return session.getPeriods().stream()
                .filter(p -> p.getPeriodNum() == periodNum)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        periodNum + "교시 정보를 찾을 수 없습니다."));
    }

    /**
     * 영상을 로컬 파일시스템에 저장하고 경로를 반환한다.
     * 경로: {uploadBasePath}/{userId}/{sessionId}/period_{num}.mp4
     */
    private String saveVideoLocally(MultipartFile video, String userId,
                                    String sessionId, int periodNum) {
        try {
            Path dir = Paths.get(uploadBasePath, userId, sessionId);
            Files.createDirectories(dir);

            String extension = getFileExtension(video.getOriginalFilename());
            Path filePath = dir.resolve("period_" + periodNum + "." + extension);
            Files.write(filePath, video.getBytes());
            log.info("영상 로컬 저장 완료: {}", filePath.toAbsolutePath());

            return filePath.toString();
        } catch (IOException e) {
            log.error("영상 로컬 저장 실패. sessionId={}, periodNum={}", sessionId, periodNum, e);
            throw new RuntimeException("영상 저장에 실패했습니다.", e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "mp4";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private Map<String, Integer> computeAverageCompetencyScores(List<PeriodFeedback> feedbacks) {
        Map<String, Integer> result = new HashMap<>();
        if (feedbacks.isEmpty()) return result;
        String[] keys = {
            "answerStructure",
            "speechSpeed", "voiceVolume",
            "fillerWords", "speechBreak",
            "eyeContact", "facialExpression", "posture",
            "voiceTone", "intonation", "emphasis"
        };
        for (String key : keys) {
            int sum = 0, count = 0;
            for (PeriodFeedback pf : feedbacks) {
                if (pf.getScores() != null && pf.getScores().containsKey(key)) {
                    sum += pf.getScores().get(key);
                    count++;
                }
            }
            if (count > 0) result.put(key, sum / count);
        }
        return result;
    }

    private void enrichSessionComparisons(String userId, String currentSessionId, FinalFeedback finalFeedback) {
        List<InterviewSession> completed = sessionRepository.findByUserIdAndStatus(userId, InterviewStatus.COMPLETED);
        List<InterviewSession> others = completed.stream()
                .filter(s -> !s.getId().equals(currentSessionId))
                .filter(s -> s.getFinalFeedback() != null && s.getCompletedAt() != null)
                .sorted((a, b) -> a.getCompletedAt().compareTo(b.getCompletedAt()))
                .collect(Collectors.toList());

        if (!others.isEmpty()) {
            InterviewSession prev = others.get(others.size() - 1);
            finalFeedback.setPrevSessionScore(prev.getFinalFeedback().getTotalScore());
            InterviewSession first = others.get(0);
            finalFeedback.setFirstSessionScore(first.getFinalFeedback().getTotalScore());

            int diff = finalFeedback.getTotalScore() - prev.getFinalFeedback().getTotalScore();
            finalFeedback.setComparisonWithPrev(
                    diff > 0 ? "이전 면접 대비 +" + diff + "점 향상" :
                    diff < 0 ? "이전 면접 대비 " + diff + "점 하락" :
                    "이전 면접과 동일한 점수입니다.");
        } else {
            finalFeedback.setComparisonWithPrev("첫 번째 면접입니다.");
        }
    }

    /**
     * 최근 3회(현재 세션 제외) 완료된 면접의 역량 점수를 평균 내어 가장 낮은 항목을 찾고
     * One Point 코칭 메시지를 생성하여 finalFeedback에 설정한다.
     * 이전 면접이 없으면 현재 세션의 역량 점수에서 최약점을 사용한다.
     */
    private void enrichOnePointCoaching(String userId, String currentSessionId,
                                        InterviewSession currentSession, FinalFeedback finalFeedback) {
        try {
            List<InterviewSession> completed = sessionRepository.findByUserIdAndStatus(userId, InterviewStatus.COMPLETED);
            // 현재 세션 제외한 이전 면접 최대 3회 (최신순)
            List<InterviewSession> prevSessions = completed.stream()
                    .filter(s -> !s.getId().equals(currentSessionId))
                    .filter(s -> s.getFinalFeedback() != null && s.getFinalFeedback().getCompetencyScores() != null)
                    .filter(s -> s.getCompletedAt() != null)
                    .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
                    .limit(3)
                    .collect(Collectors.toList());

            Map<String, Double> avgScores = new HashMap<>();
            // 역량 그룹별 대표 키 1개씩 (5개 그룹)
            String[] keys = {"answerStructure", "speechSpeed", "fillerWords", "eyeContact", "voiceTone"};

            if (!prevSessions.isEmpty()) {
                for (String key : keys) {
                    double sum = 0;
                    int count = 0;
                    for (InterviewSession s : prevSessions) {
                        Map<String, Integer> cs = s.getFinalFeedback().getCompetencyScores();
                        if (cs != null && cs.containsKey(key)) {
                            sum += cs.get(key);
                            count++;
                        }
                    }
                    if (count > 0) avgScores.put(key, sum / count);
                }
            } else {
                // 첫 번째 면접이면 현재 세션 점수 사용
                Map<String, Integer> cs = finalFeedback.getCompetencyScores();
                if (cs != null) cs.forEach((k, v) -> avgScores.put(k, (double) v));
            }

            if (avgScores.isEmpty()) return;

            String weakest = avgScores.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            if (weakest == null) return;

            String coaching = geminiService.generateOnePointCoaching(weakest, currentSession.getTargetJob());
            finalFeedback.setWeakestCompetency(weakest);
            finalFeedback.setOnePointCoachingMessage(coaching);
            log.info("One Point 코칭 설정 완료. weakest={}, message={}", weakest, coaching);

        } catch (Exception e) {
            log.warn("One Point 코칭 생성 중 오류 — 건너뜀: {}", e.getMessage());
        }
    }

    // ───────────────────────────────────────────────
    // 영상 스트리밍 (3일간 보관)
    // ───────────────────────────────────────────────

    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> getPeriodVideo(
            String userId, String sessionId, int periodNum) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);
        PeriodResult periodResult = getPeriodResult(session, periodNum);

        String videoPath = periodResult.getVideoPath();
        if (videoPath == null) {
            throw new IllegalStateException("이 교시의 영상 경로가 없습니다.");
        }

        Path path = Paths.get(videoPath);
        if (!Files.exists(path)) {
            throw new IllegalStateException("영상 파일이 존재하지 않습니다. 보관 기간(3일)이 지났을 수 있습니다.");
        }

        try {
            org.springframework.core.io.Resource resource =
                    new org.springframework.core.io.FileSystemResource(path.toFile());
            String mimeType = Files.probeContentType(path);
            if (mimeType == null) mimeType = "video/mp4";
            return org.springframework.http.ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(mimeType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .header(org.springframework.http.HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(resource);
        } catch (IOException e) {
            throw new RuntimeException("영상 파일을 읽을 수 없습니다.", e);
        }
    }

    // ───────────────────────────────────────────────
    // 영상 삭제 (VideoCleanupService에서 호출)
    // ───────────────────────────────────────────────

    public void deleteSessionVideos(String userId, String sessionId) {
        try {
            Path dir = Paths.get(uploadBasePath, userId, sessionId);
            if (!Files.exists(dir)) return;
            try (var stream = Files.walk(dir)) {
                stream.sorted(java.util.Comparator.reverseOrder())
                      .forEach(path -> {
                          try { Files.delete(path); }
                          catch (IOException ex) { log.warn("영상 파일 삭제 실패: {}", path, ex); }
                      });
            }
            log.info("세션 영상 삭제 완료. userId={}, sessionId={}", userId, sessionId);
        } catch (IOException e) {
            log.warn("세션 영상 디렉토리 삭제 실패. userId={}, sessionId={}", userId, sessionId, e);
        }
    }

    private FinalFeedbackResponse buildFinalFeedbackResponse(InterviewSession session) {
        List<PeriodFeedback> periodFeedbacks = session.getPeriods().stream()
                .filter(p -> p.getParsedFeedback() != null)
                .map(PeriodResult::getParsedFeedback)
                .collect(Collectors.toList());

        // completedAt == null 인 교시는 피드백 생성이 완료되지 않은 교시(break 중 사전 생성된 빈 교시 포함)
        List<com.readyq.dto.interview.PeriodDetail> periodDetails = session.getPeriods().stream()
                .filter(pr -> pr.getCompletedAt() != null)
                .map(pr -> {
                    boolean hasVideo = pr.getVideoPath() != null
                            && Files.exists(Paths.get(pr.getVideoPath()));
                    return com.readyq.dto.interview.PeriodDetail.builder()
                            .periodNum(pr.getPeriodNum())
                            .question(pr.getQuestion())
                            .transcript(pr.getTranscript())
                            .hasVideo(hasVideo)
                            .feedback(pr.getParsedFeedback())
                            .build();
                })
                .collect(Collectors.toList());

        return FinalFeedbackResponse.builder()
                .sessionId(session.getId())
                .finalFeedback(session.getFinalFeedback())
                .periodFeedbacks(periodFeedbacks)
                .periodDetails(periodDetails)
                .build();
    }
}

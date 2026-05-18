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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final GeminiInterviewService geminiService;
    private final ExecutorService geminiExecutor = Executors.newCachedThreadPool();

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
    // 2. 영상 제출 → 피드백 생성 + 저장 → 쉬는시간 응답
    // ───────────────────────────────────────────────

    public BreakTimeResponse submitPeriodAnswer(String userId,
                                                String sessionId,
                                                int periodNum,
                                                MultipartFile video) {
        InterviewSession session = getSessionAndValidateOwner(sessionId, userId);

        PeriodResult periodResult = getPeriodResult(session, periodNum);

        long tTotal = System.currentTimeMillis();

        // 영상 로컬 저장
        long t0 = System.currentTimeMillis();
        String videoPath = saveVideoLocally(video, userId, sessionId, periodNum);
        periodResult.setVideoPath(videoPath);
        log.info("[TIMING] {}교시 영상 로컬 저장: {}ms", periodNum, System.currentTimeMillis() - t0);

        // Gemini File API에 영상 업로드
        long t1 = System.currentTimeMillis();
        GeminiInterviewService.GeminiFileRef fileRef = geminiService.uploadVideoToGemini(video);
        log.info("[TIMING] {}교시 Gemini 업로드+ACTIVE 대기: {}ms", periodNum, System.currentTimeMillis() - t1);

        // Gemini URI 저장 (이후 교시 질문 생성에 재활용)
        periodResult.setGeminiFileUri(fileRef.uri());
        periodResult.setGeminiMimeType(fileRef.mimeType());

        // 피드백 생성 + 꼬리질문 생성 병렬 실행
        long t2 = System.currentTimeMillis();
        CompletableFuture<String> feedbackFuture = CompletableFuture.supplyAsync(() ->
                geminiService.generatePeriodFeedback(
                        fileRef.uri(),
                        fileRef.mimeType(),
                        periodResult.getQuestion(),
                        session.getInterviewerType(),
                        null
                ), geminiExecutor);

        CompletableFuture<List<String>> followUpFuture = CompletableFuture.supplyAsync(() ->
                geminiService.generateFollowUpQuestions(
                        fileRef.uri(), fileRef.mimeType(), periodResult.getQuestion()
                ), geminiExecutor);

        String feedbackJson = feedbackFuture.join();
        List<String> followUpQuestions = followUpFuture.join();
        log.info("[TIMING] {}교시 피드백+꼬리질문 병렬 생성: {}ms", periodNum, System.currentTimeMillis() - t2);
        log.info("[TIMING] {}교시 submitPeriodAnswer 전체: {}ms", periodNum, System.currentTimeMillis() - tTotal);

        PeriodFeedback parsedFeedback = geminiService.parsePeriodFeedback(feedbackJson);

        // PeriodResult 업데이트
        periodResult.setFeedbackJson(feedbackJson);
        periodResult.setParsedFeedback(parsedFeedback);
        periodResult.setFollowUpQuestions(followUpQuestions);
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
            List<String> previousQuestions = session.getPeriods().stream()
                    .map(PeriodResult::getQuestion)
                    .collect(Collectors.toList());

            // 1교시 자기소개 영상이 있으면 영상 기반 질문 생성
            PeriodResult introPeriod = session.getPeriods().stream()
                    .filter(p -> p.getPeriodNum() == 1 && p.getGeminiFileUri() != null)
                    .findFirst()
                    .orElse(null);

            if (introPeriod != null) {
                nextQuestion = geminiService.generateQuestionFromIntroVideo(
                        introPeriod.getGeminiFileUri(),
                        introPeriod.getGeminiMimeType() != null ? introPeriod.getGeminiMimeType() : "video/mp4",
                        null,
                        session.getTargetCompany(),
                        session.getTargetJob(),
                        session.getInterviewerType(),
                        previousQuestions
                );
            } else {
                nextQuestion = geminiService.generateNewQuestion(
                        null,
                        session.getTargetCompany(),
                        session.getTargetJob(),
                        previousQuestions
                );
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

        session.setFinalFeedback(finalFeedback);
        session.setStatus(InterviewStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        deleteSessionVideos(userId, sessionId);

        return buildFinalFeedbackResponse(session);
    }

    // ───────────────────────────────────────────────
    // 6. 과거 면접 목록 조회
    // ───────────────────────────────────────────────

    public List<InterviewSession> getInterviewHistory(String userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
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

    private void deleteSessionVideos(String userId, String sessionId) {
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

    private Map<String, Integer> computeAverageCompetencyScores(List<PeriodFeedback> feedbacks) {
        Map<String, Integer> result = new HashMap<>();
        if (feedbacks.isEmpty()) return result;
        String[] keys = {"logicStructure", "speechSpeed", "voiceVolume", "eyeContact", "fillerWords", "answerClarity"};
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

    private FinalFeedbackResponse buildFinalFeedbackResponse(InterviewSession session) {
        List<PeriodFeedback> periodFeedbacks = session.getPeriods().stream()
                .filter(p -> p.getParsedFeedback() != null)
                .map(PeriodResult::getParsedFeedback)
                .collect(Collectors.toList());

        return FinalFeedbackResponse.builder()
                .sessionId(session.getId())
                .finalFeedback(session.getFinalFeedback())
                .periodFeedbacks(periodFeedbacks)
                .build();
    }
}

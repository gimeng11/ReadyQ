package com.readyq.service;

import com.readyq.model.interview.InterviewSession;
import com.readyq.model.interview.InterviewStatus;
import com.readyq.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoCleanupService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewService interviewService;

    /**
     * 매일 새벽 3시에 완료 후 3일이 지난 면접 영상을 삭제한다.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredVideos() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
        List<InterviewSession> expired = sessionRepository
                .findByStatusAndCompletedAtBefore(InterviewStatus.COMPLETED, cutoff);

        int count = 0;
        for (InterviewSession session : expired) {
            boolean hasAnyVideo = session.getPeriods().stream()
                    .anyMatch(pr -> pr.getVideoPath() != null);
            if (hasAnyVideo) {
                interviewService.deleteSessionVideos(session.getUserId(), session.getId());
                count++;
            }
        }
        if (count > 0) {
            log.info("[VideoCleanup] 만료 영상 삭제 완료. {} 세션 처리", count);
        }
    }
}

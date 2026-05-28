package com.readyq.repository;

import com.readyq.model.interview.InterviewSession;
import com.readyq.model.interview.InterviewStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewSessionRepository extends MongoRepository<InterviewSession, String> {

    List<InterviewSession> findByUserId(String userId);

    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(String userId);

    List<InterviewSession> findByUserIdAndStatus(String userId, InterviewStatus status);

    // 3일 경과 완료 세션 조회 (영상 정리용)
    List<InterviewSession> findByStatusAndCompletedAtBefore(InterviewStatus status, LocalDateTime cutoff);
}

package com.readyq.repository;

import com.readyq.model.CoverLetterRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoverLetterRecordRepository extends MongoRepository<CoverLetterRecord, String> {
    List<CoverLetterRecord> findByUserIdOrderByCreatedAtDesc(String userId);
}

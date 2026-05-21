package com.readyq.repository;

import com.readyq.model.community.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByBoardIdOrderByCreatedAtAsc(String boardId);
    List<Comment> findByUsername(String username);
}
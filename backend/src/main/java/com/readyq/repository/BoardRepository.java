package com.readyq.repository;

import com.readyq.model.community.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BoardRepository extends MongoRepository<Board, String> {
    //최신순 정렬기능
    List<Board> findByBoardTypeOrderByCreatedAtDesc(String boardType);

    //인기글
    List<Board> findByLikesGreaterThanEqualOrderByCreatedAtDesc(int likes);
}

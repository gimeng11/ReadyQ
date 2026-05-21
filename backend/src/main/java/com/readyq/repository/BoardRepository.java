package com.readyq.repository;

import com.readyq.model.community.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BoardRepository extends MongoRepository<Board, String> {
    //최신순 정렬기능
    List<Board> findByBoardTypeOrderByCreatedAtDesc(String boardType);

    //인기글
    List<Board> findByLikesGreaterThanEqualOrderByCreatedAtDesc(int likes);

    // 내가 쓴 글
    List<Board> findByUsernameOrderByCreatedAtDesc(String username);

    // 좋아요한 글
    List<Board> findByLikedUsersContainsOrderByCreatedAtDesc(String username);

    // 스크랩한 글
    List<Board> findByScrappedUsersContainsOrderByCreatedAtDesc(String username);

    // 특정 ID 리스트에 포함된 글 조회
    List<Board> findByIdInOrderByCreatedAtDesc(List<String> ids);
}

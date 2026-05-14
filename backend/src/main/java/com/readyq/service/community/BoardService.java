package com.readyq.service.community;

import com.readyq.dto.community.BoardRequest;
import com.readyq.dto.community.BoardResponse;
import com.readyq.model.User;
import com.readyq.model.community.Board;
import com.readyq.repository.BoardRepository;
import com.readyq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    // 게시글 작성
    public BoardResponse createBoard(BoardRequest request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        String realNickname = user.getNickname();

        Board board = Board.builder()
                .username(username)
                .nickname(realNickname)
                .boardType(request.getBoardType())
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .isAnonymous(request.isAnonymous())
                .createdAt(LocalDateTime.now())
                .build();

        Board savedBoard = boardRepository.save(board);
        return new BoardResponse(savedBoard);
    }

    // 게시글 목록 조회
    public List<BoardResponse> getBoardsByBoardType(String boardType) {
        // 인기 탭을 눌렀을 때
        if ("인기".equals(boardType)) {
            // 좋아요가 10개 이상인 글만 가져오기
            return boardRepository.findByLikesGreaterThanEqualOrderByCreatedAtDesc(10).stream()
                    .map(BoardResponse::new)
                    .collect(Collectors.toList());
        }

        // 일반 탭을 눌렀을 때
        return boardRepository.findByBoardTypeOrderByCreatedAtDesc(boardType).stream()
                .map(BoardResponse::new)
                .collect(Collectors.toList());
    }

    // 게시글 상세 조회
    public BoardResponse getBoard(String id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));

        board.increaseViews(); // 조회수 1 증가
        boardRepository.save(board);

        return new BoardResponse(board);
    }

    // 게시글 수정
    public BoardResponse updateBoard(String id, BoardRequest request, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));

        // 권한 체크
        if (!board.getUsername().equals(username)) {
            throw new IllegalArgumentException("게시글 수정 권한이 없습니다.");
        }

        board.update(request.getTitle(), request.getContent(), request.getCategory(), request.isAnonymous());
        Board updatedBoard = boardRepository.save(board);

        return new BoardResponse(updatedBoard);
    }

    // 게시글 삭제
    public void deleteBoard(String id, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));

        // 권한 체크
        if (!board.getUsername().equals(username)) {
            throw new IllegalArgumentException("게시글 삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

}
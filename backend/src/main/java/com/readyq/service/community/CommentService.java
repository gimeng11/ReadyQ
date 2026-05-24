package com.readyq.service.community;

import com.readyq.dto.community.CommentRequest;
import com.readyq.dto.community.CommentResponse;
import com.readyq.model.User;
import com.readyq.model.community.Board;
import com.readyq.model.community.Comment;
import com.readyq.repository.BoardRepository;
import com.readyq.repository.CommentRepository;
import com.readyq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // 댓글 작성
    public CommentResponse createComment(String boardId, CommentRequest request, String username) {
        // 게시글이 있는지 확인
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .boardId(boardId)
                .username(user.getUsername())
                .nickname(user.getNickname())
                .content(request.getContent())
                .isAnonymous(request.isAnonymous())
                .createdAt(LocalDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // 댓글 수 증가
        board.increaseCommentCount();
        boardRepository.save(board);

        return new CommentResponse(savedComment);
    }

    // 댓글 조회
    public List<CommentResponse> getCommentsByBoardId(String boardId, String currentUsername) {
        return commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId).stream()
                .map(comment -> new CommentResponse(comment, currentUsername))
                .collect(Collectors.toList());
    }

    // 댓글 수정
    public CommentResponse updateComment(String commentId, CommentRequest request, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        if (!comment.getUsername().equals(username)) {
            throw new IllegalArgumentException("댓글 수정 권한이 없습니다.");
        }

        comment.update(request.getContent(), request.isAnonymous());
        return new CommentResponse(commentRepository.save(comment));
    }

    //댓글 삭제
    public void deleteComment(String commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        // 권한 체크
        if (!comment.getUsername().equals(username)) {
            throw new IllegalArgumentException("댓글 삭제 권한이 없습니다.");
        }

        String boardId = comment.getBoardId();
        commentRepository.delete(comment);

        // 댓글 카운트 차감
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        board.decreaseCommentCount();
        boardRepository.save(board);
    }
}
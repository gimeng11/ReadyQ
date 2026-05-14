package com.readyq.controller.community;

import com.readyq.dto.community.CommentRequest;
import com.readyq.dto.community.CommentResponse;
import com.readyq.service.community.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    //댓글 작성
    @PostMapping("/api/boards/{boardId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable String boardId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(commentService.createComment(boardId, request, username));
    }

    // 댓글 조회
    @GetMapping("/api/boards/{boardId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String boardId) {
        return ResponseEntity.ok(commentService.getCommentsByBoardId(boardId));
    }

    // 댓글 수정
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable String commentId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(commentService.updateComment(commentId, request, username));
    }

    // 댓글 삭제
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable String commentId,
            Authentication authentication) {
        String username = authentication.getName();
        commentService.deleteComment(commentId, username);
        return ResponseEntity.ok("댓글이 성공적으로 삭제되었습니다.");
    }
}
package com.readyq.controller.community;


import com.readyq.dto.community.BoardRequest;
import com.readyq.dto.community.BoardResponse;
import com.readyq.service.community.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    //게시글 작성
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@RequestBody BoardRequest request, Authentication authentication) {
        String username = authentication.getName(); // JWT 토큰에서 유저 아이디 꺼내기
        return ResponseEntity.ok(boardService.createBoard(request, username));
    }

    //탭별 목록 조회
    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoards(@RequestParam String boardType) {
        return ResponseEntity.ok(boardService.getBoardsByBoardType(boardType));
    }

    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> getBoard(@PathVariable String id) {
        return ResponseEntity.ok(boardService.getBoard(id));
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable String id,
            @RequestBody BoardRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(boardService.updateBoard(id, request, username));
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable String id, Authentication authentication) {
        String username = authentication.getName();
        boardService.deleteBoard(id, username);
        return ResponseEntity.ok("게시글이 성공적으로 삭제되었습니다.");
    }

    //좋아요
    @PostMapping("/{id}/likes")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable String id,
            Authentication authentication) {

        String username = authentication.getName();
        boolean isLiked = boardService.toggleLike(id, username);

        return ResponseEntity.ok(isLiked);
    }
}
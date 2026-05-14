package com.readyq.dto.community;
import com.readyq.model.community.Board;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class BoardResponse {
    private String id;
    private String tag; //boardType
    private String title;
    private String preview;
    private String category;
    private String author; // 익명 처리된 작성자명
    private String date;
    private int views;
    private int likes;
    private int comments;

    public BoardResponse(Board board){
        this.id = board.getId();
        this.tag = board.getBoardType();
        this.title = board.getTitle();
        // 내용이 길면 preview 생성
        this.preview = board.getContent().length() > 30 ? board.getContent().substring(0, 30) + "..." : board.getContent();
        this.category = board.getCategory();

        // 익명이면 익명으로 아니면 실제 닉네임 반환
        this.author = board.isAnonymous() ? "익명" : board.getNickname();

        this.date = board.getCreatedAt() != null ? board.getCreatedAt().format(DateTimeFormatter.ofPattern("MM.dd")) : "";
        this.views = board.getViews();
        this.likes = board.getLikes();
        this.comments = board.getCommentCount();
    }
}

package com.readyq.dto.community;

import com.readyq.model.community.Comment;
import lombok.Getter;
import java.time.format.DateTimeFormatter;

@Getter
public class CommentResponse {
    private String id;
    private String content;
    private String author; // 익명 처리된 닉네임
    private String date;
    private boolean isMyComment;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.author = comment.isAnonymous() ? "익명" : comment.getNickname();
        this.date = comment.getCreatedAt() != null ?
                comment.getCreatedAt().format(DateTimeFormatter.ofPattern("MM.dd HH:mm")) : "";
        this.isMyComment = false;
    }

    public CommentResponse(Comment comment, String currentUsername) {
        this(comment);
        if (currentUsername != null) {
            this.isMyComment = comment.getUsername().equals(currentUsername);
        }
    }
}
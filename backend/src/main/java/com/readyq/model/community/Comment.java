package com.readyq.model.community;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Getter
@Builder
public class Comment {
    @Id
    private String id;
    private String boardId;
    private String username; // 작성자 권한 체크용 아이디
    private String nickname; // 실제 닉네임
    private String content;
    private boolean isAnonymous;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // 댓글 수정
    public void update(String content, boolean isAnonymous) {
        this.content = content;
        this.isAnonymous = isAnonymous;
    }
}
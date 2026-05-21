package com.readyq.model.community;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashSet;
import java.util.Set;

import java.time.LocalDateTime;

@Document(collection = "boards")
@Getter
@Builder
public class Board {
    @Id
    private String id;

    private String username;
    private String nickname;

    private String boardType; // 면접연습, 꿀팁, 취준
    private String category;

    private String title;
    private String content;

    private boolean isAnonymous; // 익명 여부

    @Builder.Default private int views = 0;
    @Builder.Default private int likes = 0;
    @Builder.Default private int commentCount = 0;
    @Builder.Default private Set<String> likedUsers = new HashSet<>();
    @Builder.Default private Set<String> scrappedUsers = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    //조회수
    public void increaseViews() {
        this.views++;
    }

    public void update(String title, String content, String category, boolean isAnonymous) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.isAnonymous = isAnonymous;
    }
    //댓글수
    public void increaseCommentCount() {
        this.commentCount++;
    }
    public void decreaseCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }
    //좋아요
    public boolean toggleLike(String username) {
        if (this.likedUsers == null) {
            this.likedUsers = new HashSet<>();
        }

        // 이미 누른 사람인지 확인
        if (this.likedUsers.contains(username)) {
            // 이미 눌렀다면 바구니에서 제거
            this.likedUsers.remove(username);
            this.likes = this.likedUsers.size();
            return false;
        } else {
            this.likedUsers.add(username);
            this.likes = this.likedUsers.size();
            return true;
        }
    }

    // 스크랩
    public boolean toggleScrap(String username) {
        if (this.scrappedUsers == null) {
            this.scrappedUsers = new HashSet<>();
        }

        if (this.scrappedUsers.contains(username)) {
            this.scrappedUsers.remove(username);
            return false;
        } else {
            this.scrappedUsers.add(username);
            return true;
        }
    }
}
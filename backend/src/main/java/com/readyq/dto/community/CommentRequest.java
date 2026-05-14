package com.readyq.dto.community;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {
    private String content;
    private boolean isAnonymous;
}
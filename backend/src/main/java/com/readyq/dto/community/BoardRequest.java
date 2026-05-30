package com.readyq.dto.community;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardRequest {
    private String boardType;
    private String category;
    private String title;
    private String content;
    private boolean isAnonymous;
}

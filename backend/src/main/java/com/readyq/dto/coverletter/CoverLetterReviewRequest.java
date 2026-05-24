package com.readyq.dto.coverletter;

import lombok.Data;

@Data
public class CoverLetterReviewRequest {
    private String text;
    private boolean includeSpellCheck = true;
}

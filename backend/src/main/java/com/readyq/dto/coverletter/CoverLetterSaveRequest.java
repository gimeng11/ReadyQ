package com.readyq.dto.coverletter;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CoverLetterSaveRequest {
    private String title;
    private String text;
    private int overallScore;
    private String overallComment;
    private List<String> strengths;
    private List<Map<String, String>> improvements;
    private List<SpellerError> spellerErrors;
    private boolean spellerAvailable;
    private boolean spellerChecked;
}

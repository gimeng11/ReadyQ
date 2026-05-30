package com.readyq.model;

import com.readyq.dto.coverletter.SpellerError;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cover_letter_records")
public class CoverLetterRecord {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String text;

    private int overallScore;
    private String overallComment;
    private List<String> strengths;
    private List<Map<String, String>> improvements;
    private List<SpellerError> spellerErrors;
    private boolean spellerAvailable;
    private boolean spellerChecked;

    @Builder.Default
    private boolean pinned = false;

    private LocalDateTime createdAt;
}

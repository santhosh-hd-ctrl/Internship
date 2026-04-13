package com.codearena.dto.response;

import com.codearena.model.Submission;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String username;
    private String code;
    private String language;
    private Submission.Status status;
    private Long executionTimeMs;
    private Long memoryUsedKb;
    private Integer testCasesPassed;
    private Integer totalTestCases;
    private Integer scoreEarned;
    private String errorMessage;
    private LocalDateTime submittedAt;
    private List<TestResult> testResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResult {
        private Integer testNumber;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private Boolean passed;
        private Long executionTimeMs;
        private String error;
        private Boolean isHidden;
    }
}

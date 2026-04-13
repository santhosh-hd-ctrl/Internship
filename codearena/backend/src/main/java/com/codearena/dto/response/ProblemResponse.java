package com.codearena.dto.response;

import com.codearena.model.Problem;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponse {
    private Long id;
    private String title;
    private String description;
    private String constraints;
    private String inputFormat;
    private String outputFormat;
    private Problem.Difficulty difficulty;
    private Integer points;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private String sampleInput;
    private String sampleOutput;
    private String starterCode;
    private String tags;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private Integer totalSubmissions;
    private Integer acceptedSubmissions;
    private Double acceptanceRate;
    private List<TestCaseResponse> testCases;
    private Boolean solvedByCurrentUser;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResponse {
        private Long id;
        private String input;
        private String expectedOutput;
        private Boolean isHidden;
        private Integer orderIndex;
        private String explanation;
    }
}

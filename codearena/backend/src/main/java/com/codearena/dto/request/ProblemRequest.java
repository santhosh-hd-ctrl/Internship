package com.codearena.dto.request;

import com.codearena.model.Problem;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProblemRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String constraints;
    private String inputFormat;
    private String outputFormat;

    @NotNull(message = "Difficulty is required")
    private Problem.Difficulty difficulty;

    @NotNull(message = "Points are required")
    @Min(value = 1) @Max(value = 1000)
    private Integer points;

    @Min(value = 500) @Max(value = 10000)
    private Integer timeLimitMs = 2000;

    @Min(value = 32) @Max(value = 512)
    private Integer memoryLimitMb = 256;

    private String sampleInput;
    private String sampleOutput;
    private String starterCode;
    private String tags;

    private List<TestCaseRequest> testCases;

    @Data
    public static class TestCaseRequest {
        @NotBlank
        private String input;
        @NotBlank
        private String expectedOutput;
        private Boolean isHidden = true;
        private Integer orderIndex;
        private String explanation;
    }
}

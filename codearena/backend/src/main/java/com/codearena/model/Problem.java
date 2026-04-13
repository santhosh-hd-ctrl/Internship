package com.codearena.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"testCases", "createdBy"})
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(nullable = false)
    private Integer points;

    @Column(name = "time_limit_ms")
    @Builder.Default
    private Integer timeLimitMs = 2000;

    @Column(name = "memory_limit_mb")
    @Builder.Default
    private Integer memoryLimitMb = 256;

    @Column(name = "sample_input", columnDefinition = "TEXT")
    private String sampleInput;

    @Column(name = "sample_output", columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    @Column(name = "solution_template", columnDefinition = "TEXT")
    private String solutionTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "total_submissions")
    @Builder.Default
    private Integer totalSubmissions = 0;

    @Column(name = "accepted_submissions")
    @Builder.Default
    private Integer acceptedSubmissions = 0;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public double getAcceptanceRate() {
        if (totalSubmissions == null || totalSubmissions == 0) return 0.0;
        return (double) acceptedSubmissions / totalSubmissions * 100;
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}

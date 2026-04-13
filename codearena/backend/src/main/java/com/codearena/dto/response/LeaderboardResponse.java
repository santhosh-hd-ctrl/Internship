package com.codearena.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private Integer rank;
    private Long userId;
    private String username;
    private String fullName;
    private Integer totalScore;
    private Integer problemsSolved;
    private String avatarUrl;
    private Long totalSubmissions;
}

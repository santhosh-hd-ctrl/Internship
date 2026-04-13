package com.codearena.controller;

import com.codearena.dto.response.ApiResponse;
import com.codearena.dto.response.LeaderboardResponse;
import com.codearena.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        List<LeaderboardResponse> leaderboard = leaderboardService.getLeaderboard(limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}

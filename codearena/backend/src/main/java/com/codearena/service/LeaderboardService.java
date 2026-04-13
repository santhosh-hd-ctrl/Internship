package com.codearena.service;

import com.codearena.dto.response.LeaderboardResponse;
import com.codearena.model.User;
import com.codearena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    public List<LeaderboardResponse> getLeaderboard(int limit) {
        List<User> users = userRepository.findLeaderboard(PageRequest.of(0, Math.min(limit, 100)));
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        for (int i = 0; i < users.size(); i++) {
            User u = users.get(i);
            leaderboard.add(LeaderboardResponse.builder()
                    .rank(i + 1)
                    .userId(u.getId())
                    .username(u.getUsername())
                    .fullName(u.getFullName())
                    .totalScore(u.getTotalScore())
                    .problemsSolved(u.getProblemsSolved())
                    .avatarUrl(u.getAvatarUrl())
                    .build());
        }
        return leaderboard;
    }
}

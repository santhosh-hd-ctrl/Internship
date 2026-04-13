package com.codearena.controller;

import com.codearena.dto.request.ProblemRequest;
import com.codearena.dto.response.ApiResponse;
import com.codearena.dto.response.ProblemResponse;
import com.codearena.model.Problem;
import com.codearena.model.User;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.SubmissionRepository;
import com.codearena.repository.UserRepository;
import com.codearena.service.ProblemService;
import com.codearena.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProblemService problemService;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countRegularUsers());
        stats.put("totalProblems", problemRepository.count());
        stats.put("easyProblems", problemRepository.countByDifficulty(Problem.Difficulty.EASY));
        stats.put("mediumProblems", problemRepository.countByDifficulty(Problem.Difficulty.MEDIUM));
        stats.put("hardProblems", problemRepository.countByDifficulty(Problem.Difficulty.HARD));
        stats.put("totalSubmissions", submissionRepository.countTotal());
        stats.put("acceptedSubmissions", submissionRepository.countTotalAccepted());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/problems")
    public ResponseEntity<ApiResponse<Page<ProblemResponse>>> getAllProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ProblemResponse> problems = problemService.getAllProblemsAdmin(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(problems));
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> getProblem(@PathVariable Long id) {
        ProblemResponse problem = problemService.getProblemByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(problem));
    }

    @PostMapping("/problems")
    public ResponseEntity<ApiResponse<ProblemResponse>> createProblem(
            @Valid @RequestBody ProblemRequest request,
            @AuthenticationPrincipal User admin) {
        ProblemResponse problem = problemService.createProblem(request, admin);
        return ResponseEntity.ok(ApiResponse.success("Problem created successfully", problem));
    }

    @PutMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request,
            @AuthenticationPrincipal User admin) {
        ProblemResponse problem = problemService.updateProblem(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", problem));
    }

    @DeleteMapping("/problems/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted", null));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Map<String, Object>> users = userRepository.findActiveUsers(
                PageRequest.of(page, size, Sort.by("totalScore").descending()))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("email", u.getEmail());
                    map.put("fullName", u.getFullName());
                    map.put("role", u.getRole());
                    map.put("totalScore", u.getTotalScore());
                    map.put("problemsSolved", u.getProblemsSolved());
                    map.put("createdAt", u.getCreatedAt());
                    map.put("isActive", u.getIsActive());
                    return map;
                });
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}

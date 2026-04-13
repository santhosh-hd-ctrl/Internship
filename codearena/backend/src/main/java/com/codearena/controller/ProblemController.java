package com.codearena.controller;

import com.codearena.dto.response.ApiResponse;
import com.codearena.dto.response.ProblemResponse;
import com.codearena.model.User;
import com.codearena.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProblemResponse>>> getProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal User currentUser) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProblemResponse> problems = problemService.getProblems(query, difficulty, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success(problems));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> getProblem(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ProblemResponse problem = problemService.getProblemById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(problem));
    }
}

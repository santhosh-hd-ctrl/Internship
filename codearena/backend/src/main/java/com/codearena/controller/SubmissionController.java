package com.codearena.controller;

import com.codearena.dto.request.SubmissionRequest;
import com.codearena.dto.response.ApiResponse;
import com.codearena.dto.response.SubmissionResponse;
import com.codearena.model.User;
import com.codearena.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User user) {
        SubmissionResponse response = submissionService.submit(request, user);
        return ResponseEntity.ok(ApiResponse.success("Code submitted successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<SubmissionResponse>>> getMySubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        Page<SubmissionResponse> submissions = submissionService.getUserSubmissions(
                user, PageRequest.of(page, size, Sort.by("submittedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<ApiResponse<Page<SubmissionResponse>>> getProblemSubmissions(
            @PathVariable Long problemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        Page<SubmissionResponse> submissions = submissionService.getUserProblemSubmissions(
                user, problemId, PageRequest.of(page, size, Sort.by("submittedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        SubmissionResponse response = submissionService.getSubmissionById(id, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

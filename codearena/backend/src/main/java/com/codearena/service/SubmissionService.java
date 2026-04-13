package com.codearena.service;

import com.codearena.dto.request.SubmissionRequest;
import com.codearena.dto.response.SubmissionResponse;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.model.*;
import com.codearena.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final CodeExecutionService codeExecutionService;

    @Transactional
    public SubmissionResponse submit(SubmissionRequest request, User user) {
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem", request.getProblemId()));

        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage().toUpperCase())
                .status(Submission.Status.RUNNING)
                .testCasesPassed(0)
                .totalTestCases(0)
                .scoreEarned(0)
                .build();
        submission = submissionRepository.save(submission);

        List<TestCase> testCases = testCaseRepository.findByProblemOrderByOrderIndex(problem);
        List<SubmissionResponse.TestResult> testResults =
                codeExecutionService.executeJava(request.getCode(), testCases);

        int passed = (int) testResults.stream().filter(r -> Boolean.TRUE.equals(r.getPassed())).count();
        int total = testResults.size();

        Submission.Status status;
        String errorMessage = null;

        if (total == 0) {
            status = Submission.Status.WRONG_ANSWER;
        } else {
            SubmissionResponse.TestResult firstFailed = testResults.stream()
                    .filter(r -> !Boolean.TRUE.equals(r.getPassed()))
                    .findFirst()
                    .orElse(null);

            if (firstFailed != null && firstFailed.getError() != null) {
                String err = firstFailed.getError();
                if (err.startsWith("COMPILATION_ERROR")) {
                    status = Submission.Status.COMPILATION_ERROR;
                    errorMessage = err.replace("COMPILATION_ERROR: ", "");
                } else if (err.startsWith("TIME_LIMIT_EXCEEDED")) {
                    status = Submission.Status.TIME_LIMIT_EXCEEDED;
                } else if (err.startsWith("RUNTIME_ERROR")) {
                    status = Submission.Status.RUNTIME_ERROR;
                    errorMessage = err.replace("RUNTIME_ERROR: ", "");
                } else {
                    status = Submission.Status.WRONG_ANSWER;
                }
            } else if (passed == total) {
                status = Submission.Status.ACCEPTED;
            } else {
                status = Submission.Status.WRONG_ANSWER;
            }
        }

        int scoreEarned = 0;
        if (status == Submission.Status.ACCEPTED) {
            scoreEarned = problem.getPoints();
        } else if (passed > 0) {
            scoreEarned = (int) Math.floor((double) passed / total * problem.getPoints() * 0.5);
        }

        long maxExecTime = testResults.stream()
                .mapToLong(r -> r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : 0L)
                .max()
                .orElse(0L);

        submission.setStatus(status);
        submission.setTestCasesPassed(passed);
        submission.setTotalTestCases(total);
        submission.setScoreEarned(scoreEarned);
        submission.setErrorMessage(errorMessage);
        submission.setExecutionTimeMs(maxExecTime);
        submissionRepository.save(submission);

        problem.setTotalSubmissions(problem.getTotalSubmissions() + 1);
        if (status == Submission.Status.ACCEPTED) {
            problem.setAcceptedSubmissions(problem.getAcceptedSubmissions() + 1);
        }
        problemRepository.save(problem);

        // Update user score - count accepted submissions for this problem BEFORE this one
        if (status == Submission.Status.ACCEPTED) {
            long previousAccepted = submissionRepository.countAcceptedByUserAndProblem(user, problem);
            // previousAccepted includes the just-saved one, so first time = 1
            if (previousAccepted <= 1) {
                user.setProblemsSolved(user.getProblemsSolved() + 1);
            }
            user.setTotalScore(user.getTotalScore() + scoreEarned);
            userRepository.save(user);
        }

        logger.info("Submission by {} on problem {}: {} ({}/{})",
                user.getUsername(), problem.getId(), status, passed, total);

        return buildSubmissionResponse(submission, testResults);
    }

    public Page<SubmissionResponse> getUserSubmissions(User user, Pageable pageable) {
        return submissionRepository.findByUserOrderBySubmittedAtDesc(user, pageable)
                .map(s -> buildSubmissionResponse(s, null));
    }

    public Page<SubmissionResponse> getProblemSubmissions(Long problemId, Pageable pageable) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", problemId));
        return submissionRepository.findByProblemOrderBySubmittedAtDesc(problem, pageable)
                .map(s -> buildSubmissionResponse(s, null));
    }

    public Page<SubmissionResponse> getUserProblemSubmissions(User user, Long problemId, Pageable pageable) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", problemId));
        return submissionRepository.findByUserAndProblemOrderBySubmittedAtDesc(user, problem, pageable)
                .map(s -> buildSubmissionResponse(s, null));
    }

    public SubmissionResponse getSubmissionById(Long id, User user) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", id));
        if (user.getRole() != User.Role.ADMIN && !submission.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return buildSubmissionResponse(submission, null);
    }

    private SubmissionResponse buildSubmissionResponse(Submission s, List<SubmissionResponse.TestResult> testResults) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .problemId(s.getProblem().getId())
                .problemTitle(s.getProblem().getTitle())
                .username(s.getUser().getUsername())
                .code(s.getCode())
                .language(s.getLanguage())
                .status(s.getStatus())
                .executionTimeMs(s.getExecutionTimeMs())
                .memoryUsedKb(s.getMemoryUsedKb())
                .testCasesPassed(s.getTestCasesPassed())
                .totalTestCases(s.getTotalTestCases())
                .scoreEarned(s.getScoreEarned())
                .errorMessage(s.getErrorMessage())
                .submittedAt(s.getSubmittedAt())
                .testResults(testResults)
                .build();
    }
}

package com.codearena.service;

import com.codearena.dto.request.ProblemRequest;
import com.codearena.dto.response.ProblemResponse;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.model.Problem;
import com.codearena.model.TestCase;
import com.codearena.model.User;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.SubmissionRepository;
import com.codearena.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private static final Logger logger = LoggerFactory.getLogger(ProblemService.class);

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;

    @Transactional
    public ProblemResponse createProblem(ProblemRequest request, User creator) {
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .constraints(request.getConstraints())
                .inputFormat(request.getInputFormat())
                .outputFormat(request.getOutputFormat())
                .difficulty(request.getDifficulty())
                .points(request.getPoints())
                .timeLimitMs(request.getTimeLimitMs())
                .memoryLimitMb(request.getMemoryLimitMb())
                .sampleInput(request.getSampleInput())
                .sampleOutput(request.getSampleOutput())
                .starterCode(request.getStarterCode())
                .tags(request.getTags())
                .createdBy(creator)
                .isActive(true)
                .build();

        problem = problemRepository.save(problem);

        if (request.getTestCases() != null) {
            List<TestCase> testCases = new ArrayList<>();
            for (int i = 0; i < request.getTestCases().size(); i++) {
                ProblemRequest.TestCaseRequest tcReq = request.getTestCases().get(i);
                TestCase tc = TestCase.builder()
                        .problem(problem)
                        .input(tcReq.getInput())
                        .expectedOutput(tcReq.getExpectedOutput())
                        .isHidden(tcReq.getIsHidden())
                        .orderIndex(tcReq.getOrderIndex() != null ? tcReq.getOrderIndex() : i)
                        .explanation(tcReq.getExplanation())
                        .build();
                testCases.add(tc);
            }
            testCaseRepository.saveAll(testCases);
            problem.setTestCases(testCases);
        }

        logger.info("Problem created: {} by {}", problem.getTitle(), creator.getUsername());
        return mapToResponse(problem, false);
    }

    @Transactional
    public ProblemResponse updateProblem(Long id, ProblemRequest request, User updater) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id));

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setConstraints(request.getConstraints());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setDifficulty(request.getDifficulty());
        problem.setPoints(request.getPoints());
        problem.setTimeLimitMs(request.getTimeLimitMs());
        problem.setMemoryLimitMb(request.getMemoryLimitMb());
        problem.setSampleInput(request.getSampleInput());
        problem.setSampleOutput(request.getSampleOutput());
        problem.setStarterCode(request.getStarterCode());
        problem.setTags(request.getTags());

        if (request.getTestCases() != null) {
            testCaseRepository.deleteByProblem(problem);
            List<TestCase> testCases = new ArrayList<>();
            for (int i = 0; i < request.getTestCases().size(); i++) {
                ProblemRequest.TestCaseRequest tcReq = request.getTestCases().get(i);
                TestCase tc = TestCase.builder()
                        .problem(problem)
                        .input(tcReq.getInput())
                        .expectedOutput(tcReq.getExpectedOutput())
                        .isHidden(tcReq.getIsHidden())
                        .orderIndex(i)
                        .explanation(tcReq.getExplanation())
                        .build();
                testCases.add(tc);
            }
            testCaseRepository.saveAll(testCases);
            problem.setTestCases(testCases);
        }

        problem = problemRepository.save(problem);
        return mapToResponse(problem, false);
    }

    public Page<ProblemResponse> getProblems(String query, String difficulty, Pageable pageable, User currentUser) {
        Page<Problem> problems;

        if (query != null && !query.isBlank() && difficulty != null && !difficulty.isBlank()) {
            Problem.Difficulty diff = Problem.Difficulty.valueOf(difficulty.toUpperCase());
            problems = problemRepository.searchByDifficulty(query, diff, pageable);
        } else if (query != null && !query.isBlank()) {
            problems = problemRepository.searchProblems(query, pageable);
        } else if (difficulty != null && !difficulty.isBlank()) {
            Problem.Difficulty diff = Problem.Difficulty.valueOf(difficulty.toUpperCase());
            problems = problemRepository.findByDifficultyAndIsActiveTrue(diff, pageable);
        } else {
            problems = problemRepository.findByIsActiveTrue(pageable);
        }

        List<ProblemResponse> responses = problems.getContent().stream()
                .map(p -> mapToResponse(p, currentUser != null &&
                        submissionRepository.existsByUserAndProblemAndStatus(currentUser, p,
                                com.codearena.model.Submission.Status.ACCEPTED)))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, problems.getTotalElements());
    }

    public ProblemResponse getProblemById(Long id, User currentUser) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id));

        if (!problem.getIsActive()) {
            throw new ResourceNotFoundException("Problem", id);
        }

        boolean solved = currentUser != null &&
                submissionRepository.existsByUserAndProblemAndStatus(currentUser, problem,
                        com.codearena.model.Submission.Status.ACCEPTED);

        return mapToResponseWithTestCases(problem, solved, false);
    }

    public ProblemResponse getProblemByIdAdmin(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id));
        return mapToResponseWithTestCases(problem, false, true);
    }

    @Transactional
    public void deleteProblem(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id));
        problem.setIsActive(false);
        problemRepository.save(problem);
    }

    public Page<ProblemResponse> getAllProblemsAdmin(Pageable pageable) {
        return problemRepository.findAll(pageable)
                .map(p -> mapToResponse(p, false));
    }

    private ProblemResponse mapToResponse(Problem problem, boolean solvedByCurrentUser) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .points(problem.getPoints())
                .timeLimitMs(problem.getTimeLimitMs())
                .memoryLimitMb(problem.getMemoryLimitMb())
                .tags(problem.getTags())
                .createdByUsername(problem.getCreatedBy() != null ? problem.getCreatedBy().getUsername() : "system")
                .createdAt(problem.getCreatedAt())
                .totalSubmissions(problem.getTotalSubmissions())
                .acceptedSubmissions(problem.getAcceptedSubmissions())
                .acceptanceRate(problem.getAcceptanceRate())
                .solvedByCurrentUser(solvedByCurrentUser)
                .build();
    }

    private ProblemResponse mapToResponseWithTestCases(Problem problem, boolean solved, boolean includeHidden) {
        List<TestCase> testCases = testCaseRepository.findByProblemOrderByOrderIndex(problem);

        List<ProblemResponse.TestCaseResponse> tcResponses = testCases.stream()
                .filter(tc -> includeHidden || !tc.getIsHidden())
                .map(tc -> ProblemResponse.TestCaseResponse.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .isHidden(tc.getIsHidden())
                        .orderIndex(tc.getOrderIndex())
                        .explanation(tc.getExplanation())
                        .build())
                .collect(Collectors.toList());

        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .constraints(problem.getConstraints())
                .inputFormat(problem.getInputFormat())
                .outputFormat(problem.getOutputFormat())
                .difficulty(problem.getDifficulty())
                .points(problem.getPoints())
                .timeLimitMs(problem.getTimeLimitMs())
                .memoryLimitMb(problem.getMemoryLimitMb())
                .sampleInput(problem.getSampleInput())
                .sampleOutput(problem.getSampleOutput())
                .starterCode(problem.getStarterCode())
                .tags(problem.getTags())
                .createdByUsername(problem.getCreatedBy() != null ? problem.getCreatedBy().getUsername() : "system")
                .createdAt(problem.getCreatedAt())
                .totalSubmissions(problem.getTotalSubmissions())
                .acceptedSubmissions(problem.getAcceptedSubmissions())
                .acceptanceRate(problem.getAcceptanceRate())
                .testCases(tcResponses)
                .solvedByCurrentUser(solved)
                .build();
    }
}

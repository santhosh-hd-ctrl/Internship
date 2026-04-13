package com.codearena.service;

import com.codearena.dto.response.SubmissionResponse;
import com.codearena.model.TestCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionService.class);

    @Value("${codearena.execution.timeout-seconds:10}")
    private int timeoutSeconds;

    @Value("${codearena.execution.temp-dir:/tmp/codearena}")
    private String tempDir;

    public List<SubmissionResponse.TestResult> executeJava(String code, List<TestCase> testCases) {
        List<SubmissionResponse.TestResult> results = new ArrayList<>();
        String executionId = UUID.randomUUID().toString().replace("-", "");
        Path workDir = Paths.get(tempDir, executionId);

        try {
            Files.createDirectories(workDir);
            String className = extractClassName(code);
            Path sourceFile = workDir.resolve(className + ".java");
            Files.writeString(sourceFile, code);

            // Compile
            String compileError = compile(workDir, sourceFile);
            if (compileError != null) {
                for (int i = 0; i < testCases.size(); i++) {
                    TestCase tc = testCases.get(i);
                    results.add(SubmissionResponse.TestResult.builder()
                            .testNumber(i + 1)
                            .input(tc.getIsHidden() ? "[Hidden]" : tc.getInput())
                            .expectedOutput(tc.getIsHidden() ? "[Hidden]" : tc.getExpectedOutput())
                            .actualOutput("")
                            .passed(false)
                            .executionTimeMs(0L)
                            .error("COMPILATION_ERROR: " + compileError)
                            .isHidden(tc.getIsHidden())
                            .build());
                }
                return results;
            }

            // Run each test case
            for (int i = 0; i < testCases.size(); i++) {
                TestCase tc = testCases.get(i);
                SubmissionResponse.TestResult result = runTestCase(workDir, className, tc, i + 1);
                results.add(result);
            }

        } catch (IOException e) {
            logger.error("IO error during code execution: {}", e.getMessage());
        } finally {
            cleanup(workDir);
        }

        return results;
    }

    private String compile(Path workDir, Path sourceFile) {
        try {
            ProcessBuilder pb = new ProcessBuilder("javac", "-cp", workDir.toString(), sourceFile.toString());
            pb.directory(workDir.toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = readStream(process.getInputStream());
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return "Compilation timed out";
            }

            if (process.exitValue() != 0) {
                // Clean up error messages for better UX
                return cleanCompileError(output);
            }
            return null;
        } catch (Exception e) {
            return "Compilation failed: " + e.getMessage();
        }
    }

    private SubmissionResponse.TestResult runTestCase(Path workDir, String className, TestCase tc, int testNumber) {
        long startTime = System.currentTimeMillis();
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "java", "-cp", workDir.toString(),
                    "-Xmx256m", "-Xss8m",
                    className
            );
            pb.directory(workDir.toFile());

            Process process = pb.start();

            // Write input
            try (OutputStream stdin = process.getOutputStream()) {
                stdin.write(tc.getInput().getBytes());
                stdin.flush();
            }

            String actualOutput = readStreamWithTimeout(process.getInputStream(), timeoutSeconds);
            String errorOutput = readStream(process.getErrorStream());

            boolean finished = process.waitFor(timeoutSeconds + 1, TimeUnit.SECONDS);
            long execTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                return SubmissionResponse.TestResult.builder()
                        .testNumber(testNumber)
                        .input(tc.getIsHidden() ? "[Hidden]" : tc.getInput())
                        .expectedOutput(tc.getIsHidden() ? "[Hidden]" : tc.getExpectedOutput())
                        .actualOutput("")
                        .passed(false)
                        .executionTimeMs(execTime)
                        .error("TIME_LIMIT_EXCEEDED")
                        .isHidden(tc.getIsHidden())
                        .build();
            }

            if (process.exitValue() != 0 && !errorOutput.isEmpty()) {
                return SubmissionResponse.TestResult.builder()
                        .testNumber(testNumber)
                        .input(tc.getIsHidden() ? "[Hidden]" : tc.getInput())
                        .expectedOutput(tc.getIsHidden() ? "[Hidden]" : tc.getExpectedOutput())
                        .actualOutput("")
                        .passed(false)
                        .executionTimeMs(execTime)
                        .error("RUNTIME_ERROR: " + errorOutput.trim())
                        .isHidden(tc.getIsHidden())
                        .build();
            }

            boolean passed = normalize(actualOutput).equals(normalize(tc.getExpectedOutput()));

            return SubmissionResponse.TestResult.builder()
                    .testNumber(testNumber)
                    .input(tc.getIsHidden() ? "[Hidden]" : tc.getInput())
                    .expectedOutput(tc.getIsHidden() ? "[Hidden]" : tc.getExpectedOutput())
                    .actualOutput(tc.getIsHidden() && !passed ? "[Hidden]" : actualOutput.trim())
                    .passed(passed)
                    .executionTimeMs(execTime)
                    .isHidden(tc.getIsHidden())
                    .build();

        } catch (Exception e) {
            long execTime = System.currentTimeMillis() - startTime;
            return SubmissionResponse.TestResult.builder()
                    .testNumber(testNumber)
                    .input(tc.getIsHidden() ? "[Hidden]" : tc.getInput())
                    .expectedOutput(tc.getIsHidden() ? "[Hidden]" : tc.getExpectedOutput())
                    .actualOutput("")
                    .passed(false)
                    .executionTimeMs(execTime)
                    .error("EXECUTION_ERROR: " + e.getMessage())
                    .isHidden(tc.getIsHidden())
                    .build();
        }
    }

    private String extractClassName(String code) {
        // Extract public class name from Java code
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "public\\s+class\\s+(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(code);
        if (matcher.find()) {
            return matcher.group(1);
        }
        // Fallback
        pattern = java.util.regex.Pattern.compile("class\\s+(\\w+)");
        matcher = pattern.matcher(code);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "Solution";
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n");
    }

    private String cleanCompileError(String error) {
        if (error == null) return "Unknown compilation error";
        // Remove file path prefix for cleaner output
        return error.replaceAll("/tmp/codearena/[^/]+/", "").trim();
    }

    private String readStream(InputStream stream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    private String readStreamWithTimeout(InputStream stream, int timeoutSecs) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(() -> readStream(stream));
        try {
            return future.get(timeoutSecs, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            return "";
        } catch (Exception e) {
            return "";
        } finally {
            executor.shutdownNow();
        }
    }

    private void cleanup(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException e) {
            logger.warn("Could not clean up temp dir: {}", dir);
        }
    }
}

package com.codearena.config;

import com.codearena.model.Problem;
import com.codearena.model.TestCase;
import com.codearena.model.User;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.TestCaseRepository;
import com.codearena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedProblems();
    }

    private void seedAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@codearena.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("CodeArena Admin")
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            logger.info("Admin user created: admin / admin123");
        }

        if (!userRepository.existsByUsername("testuser")) {
            User user = User.builder()
                    .username("testuser")
                    .email("test@codearena.com")
                    .password(passwordEncoder.encode("test123"))
                    .fullName("Test User")
                    .role(User.Role.USER)
                    .isActive(true)
                    .build();
            userRepository.save(user);
            logger.info("Test user created: testuser / test123");
        }
    }

    private void seedProblems() {
        if (problemRepository.count() > 0) return;

        User admin = userRepository.findByUsername("admin").orElseThrow();

        // Problem 1: Two Sum
        Problem twoSum = Problem.builder()
                .title("Two Sum")
                .description("Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.")
                .constraints("• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.")
                .inputFormat("First line: array of integers (space-separated)\nSecond line: target integer")
                .outputFormat("Two space-separated indices (0-indexed) in ascending order")
                .difficulty(Problem.Difficulty.EASY)
                .points(100)
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .sampleInput("2 7 11 15\n9")
                .sampleOutput("0 1")
                .tags("array,hash-map,two-pointers")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        twoSum = problemRepository.save(twoSum);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(twoSum).input("2 7 11 15\n9").expectedOutput("0 1").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(twoSum).input("3 2 4\n6").expectedOutput("1 2").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(twoSum).input("3 3\n6").expectedOutput("0 1").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(twoSum).input("1 2 3 4 5\n9").expectedOutput("3 4").isHidden(true).orderIndex(3).build(),
                TestCase.builder().problem(twoSum).input("-1 -2 -3 -4 -5\n-8").expectedOutput("2 4").isHidden(true).orderIndex(4).build()
        ));

        // Problem 2: Reverse String
        Problem reverseStr = Problem.builder()
                .title("Reverse a String")
                .description("Write a program that reads a string and prints it reversed.\n\nThe string may contain spaces and special characters.")
                .constraints("• 1 <= |s| <= 10^5\n• String consists of printable ASCII characters")
                .inputFormat("A single line containing the string to reverse")
                .outputFormat("The reversed string on a single line")
                .difficulty(Problem.Difficulty.EASY)
                .points(50)
                .timeLimitMs(1000)
                .sampleInput("Hello World")
                .sampleOutput("dlroW olleH")
                .tags("string,basics")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        reverseStr = problemRepository.save(reverseStr);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(reverseStr).input("Hello World").expectedOutput("dlroW olleH").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(reverseStr).input("abcde").expectedOutput("edcba").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(reverseStr).input("racecar").expectedOutput("racecar").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(reverseStr).input("a").expectedOutput("a").isHidden(true).orderIndex(3).build()
        ));

        // Problem 3: Fibonacci
        Problem fibonacci = Problem.builder()
                .title("Fibonacci Number")
                .description("Given a number `n`, compute the nth Fibonacci number.\n\nThe Fibonacci sequence is defined as:\n- F(0) = 0\n- F(1) = 1\n- F(n) = F(n-1) + F(n-2) for n > 1")
                .constraints("• 0 <= n <= 45")
                .inputFormat("A single integer n")
                .outputFormat("The nth Fibonacci number")
                .difficulty(Problem.Difficulty.EASY)
                .points(75)
                .timeLimitMs(1000)
                .sampleInput("10")
                .sampleOutput("55")
                .tags("dynamic-programming,recursion,math")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        fibonacci = problemRepository.save(fibonacci);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(fibonacci).input("10").expectedOutput("55").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(fibonacci).input("0").expectedOutput("0").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(fibonacci).input("1").expectedOutput("1").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(fibonacci).input("20").expectedOutput("6765").isHidden(true).orderIndex(3).build(),
                TestCase.builder().problem(fibonacci).input("45").expectedOutput("1134903170").isHidden(true).orderIndex(4).build()
        ));

        // Problem 4: Palindrome Check
        Problem palindrome = Problem.builder()
                .title("Valid Palindrome")
                .description("A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.")
                .constraints("• 1 <= s.length <= 2 * 10^5\n• s consists only of printable ASCII characters")
                .inputFormat("A single line containing the string")
                .outputFormat("Print `true` or `false`")
                .difficulty(Problem.Difficulty.EASY)
                .points(80)
                .timeLimitMs(1000)
                .sampleInput("A man, a plan, a canal: Panama")
                .sampleOutput("true")
                .tags("string,two-pointers")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        palindrome = problemRepository.save(palindrome);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(palindrome).input("A man, a plan, a canal: Panama").expectedOutput("true").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(palindrome).input("race a car").expectedOutput("false").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(palindrome).input(" ").expectedOutput("true").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(palindrome).input("Was it a car or a cat I saw?").expectedOutput("true").isHidden(true).orderIndex(3).build()
        ));

        // Problem 5: Binary Search
        Problem binarySearch = Problem.builder()
                .title("Binary Search")
                .description("Given a sorted array of `n` integers and a target value, return the index of the target if it exists in the array. Otherwise, return -1.\n\nYou must write an algorithm with **O(log n)** runtime complexity.")
                .constraints("• 1 <= nums.length <= 10^4\n• -10^4 <= nums[i], target <= 10^4\n• All the integers in nums are unique\n• nums is sorted in ascending order")
                .inputFormat("First line: space-separated sorted integers\nSecond line: target integer")
                .outputFormat("Index of target (0-based), or -1 if not found")
                .difficulty(Problem.Difficulty.EASY)
                .points(90)
                .timeLimitMs(1000)
                .sampleInput("-1 0 3 5 9 12\n9")
                .sampleOutput("4")
                .tags("binary-search,array")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        binarySearch = problemRepository.save(binarySearch);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(binarySearch).input("-1 0 3 5 9 12\n9").expectedOutput("4").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(binarySearch).input("-1 0 3 5 9 12\n2").expectedOutput("-1").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(binarySearch).input("5\n5").expectedOutput("0").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(binarySearch).input("1 3 5 7 9 11 13 15\n13").expectedOutput("6").isHidden(true).orderIndex(3).build()
        ));

        // Problem 6: Longest Substring Without Repeating Characters (MEDIUM)
        Problem longestSubstr = Problem.builder()
                .title("Longest Substring Without Repeating Characters")
                .description("Given a string `s`, find the length of the **longest substring** without repeating characters.")
                .constraints("• 0 <= s.length <= 5 * 10^4\n• s consists of English letters, digits, symbols and spaces")
                .inputFormat("A single line containing the string s")
                .outputFormat("An integer — the length of the longest substring without repeating characters")
                .difficulty(Problem.Difficulty.MEDIUM)
                .points(200)
                .timeLimitMs(2000)
                .sampleInput("abcabcbb")
                .sampleOutput("3")
                .tags("string,sliding-window,hash-map")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        longestSubstr = problemRepository.save(longestSubstr);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(longestSubstr).input("abcabcbb").expectedOutput("3").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(longestSubstr).input("bbbbb").expectedOutput("1").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(longestSubstr).input("pwwkew").expectedOutput("3").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(longestSubstr).input("").expectedOutput("0").isHidden(true).orderIndex(3).build(),
                TestCase.builder().problem(longestSubstr).input("dvdf").expectedOutput("3").isHidden(true).orderIndex(4).build()
        ));

        // Problem 7: Merge Intervals (MEDIUM)
        Problem mergeIntervals = Problem.builder()
                .title("Merge Intervals")
                .description("Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.")
                .constraints("• 1 <= intervals.length <= 10^4\n• intervals[i].length == 2\n• 0 <= starti <= endi <= 10^4")
                .inputFormat("First line: number of intervals n\nNext n lines: two integers representing start and end of each interval")
                .outputFormat("Each merged interval on a separate line, space-separated")
                .difficulty(Problem.Difficulty.MEDIUM)
                .points(250)
                .timeLimitMs(2000)
                .sampleInput("4\n1 3\n2 6\n8 10\n15 18")
                .sampleOutput("1 6\n8 10\n15 18")
                .tags("array,sorting,intervals")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[][] intervals = new int[n][2];\n        for (int i = 0; i < n; i++) {\n            intervals[i][0] = sc.nextInt();\n            intervals[i][1] = sc.nextInt();\n        }\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        mergeIntervals = problemRepository.save(mergeIntervals);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(mergeIntervals).input("4\n1 3\n2 6\n8 10\n15 18").expectedOutput("1 6\n8 10\n15 18").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(mergeIntervals).input("4\n1 4\n4 5\n2 3\n6 8").expectedOutput("1 5\n6 8").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(mergeIntervals).input("1\n1 1").expectedOutput("1 1").isHidden(true).orderIndex(2).build()
        ));

        // Problem 8: Trapping Rain Water (HARD)
        Problem rainWater = Problem.builder()
                .title("Trapping Rain Water")
                .description("Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.")
                .constraints("• n == height.length\n• 1 <= n <= 2 * 10^4\n• 0 <= height[i] <= 10^5")
                .inputFormat("A single line of space-separated non-negative integers representing heights")
                .outputFormat("A single integer — the total units of water trapped")
                .difficulty(Problem.Difficulty.HARD)
                .points(400)
                .timeLimitMs(2000)
                .sampleInput("0 1 0 2 1 0 1 3 2 1 2 1")
                .sampleOutput("6")
                .tags("array,two-pointers,dynamic-programming,stack")
                .starterCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] height = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i]);\n        \n        // Your solution here\n        \n    }\n}")
                .createdBy(admin)
                .isActive(true)
                .build();
        rainWater = problemRepository.save(rainWater);

        testCaseRepository.saveAll(List.of(
                TestCase.builder().problem(rainWater).input("0 1 0 2 1 0 1 3 2 1 2 1").expectedOutput("6").isHidden(false).orderIndex(0).build(),
                TestCase.builder().problem(rainWater).input("4 2 0 3 2 5").expectedOutput("9").isHidden(false).orderIndex(1).build(),
                TestCase.builder().problem(rainWater).input("3 0 2 0 4").expectedOutput("7").isHidden(true).orderIndex(2).build(),
                TestCase.builder().problem(rainWater).input("1 0 1").expectedOutput("1").isHidden(true).orderIndex(3).build()
        ));

        logger.info("Seeded {} sample problems", problemRepository.count());
    }
}

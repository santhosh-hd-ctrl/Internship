package com.codearena.repository;

import com.codearena.model.TestCase;
import com.codearena.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblemOrderByOrderIndex(Problem problem);
    List<TestCase> findByProblemAndIsHiddenFalseOrderByOrderIndex(Problem problem);
    void deleteByProblem(Problem problem);
    Long countByProblem(Problem problem);
}

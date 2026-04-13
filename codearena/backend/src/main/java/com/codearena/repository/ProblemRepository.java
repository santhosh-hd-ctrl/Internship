package com.codearena.repository;

import com.codearena.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Page<Problem> findByIsActiveTrue(Pageable pageable);

    Page<Problem> findByDifficultyAndIsActiveTrue(Problem.Difficulty difficulty, Pageable pageable);

    @Query("SELECT p FROM Problem p WHERE p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Problem> searchProblems(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Problem p WHERE p.isActive = true AND p.difficulty = :difficulty AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Problem> searchByDifficulty(@Param("query") String query, @Param("difficulty") Problem.Difficulty difficulty, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Problem p WHERE p.difficulty = :difficulty AND p.isActive = true")
    Long countByDifficulty(@Param("difficulty") Problem.Difficulty difficulty);

    @Query("SELECT p FROM Problem p WHERE p.isActive = true ORDER BY p.totalSubmissions DESC")
    List<Problem> findTopProblems(Pageable pageable);
}

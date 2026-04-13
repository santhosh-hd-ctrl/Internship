package com.codearena.repository;

import com.codearena.model.Submission;
import com.codearena.model.User;
import com.codearena.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByUserOrderBySubmittedAtDesc(User user, Pageable pageable);

    Page<Submission> findByProblemOrderBySubmittedAtDesc(Problem problem, Pageable pageable);

    Page<Submission> findByUserAndProblemOrderBySubmittedAtDesc(User user, Problem problem, Pageable pageable);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user = :user AND s.problem = :problem AND s.status = 'ACCEPTED'")
    long countAcceptedByUserAndProblem(@Param("user") User user, @Param("problem") Problem problem);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.status = 'ACCEPTED'")
    Long countTotalAccepted();

    @Query("SELECT COUNT(s) FROM Submission s")
    Long countTotal();

    boolean existsByUserAndProblemAndStatus(User user, Problem problem, Submission.Status status);
}

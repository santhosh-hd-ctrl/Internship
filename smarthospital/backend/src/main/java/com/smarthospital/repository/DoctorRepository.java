package com.smarthospital.repository;

import com.smarthospital.entity.Doctor;
import com.smarthospital.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findByAvailableTrue();
    Page<Doctor> findByAvailableTrue(Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.available = true AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))")
    Page<Doctor> findBySpecialization(@Param("specialization") String specialization, Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.available = true AND " +
           "(LOWER(d.specialization) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(d.department) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(d.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Doctor> searchDoctors(@Param("keyword") String keyword, Pageable pageable);
}

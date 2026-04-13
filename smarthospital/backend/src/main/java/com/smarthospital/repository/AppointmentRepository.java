package com.smarthospital.repository;

import com.smarthospital.entity.Appointment;
import com.smarthospital.entity.Doctor;
import com.smarthospital.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientOrderByAppointmentDateDescAppointmentTimeDesc(User patient, Pageable pageable);

    Page<Appointment> findByDoctorOrderByAppointmentDateAscAppointmentTimeAsc(Doctor doctor, Pageable pageable);

    List<Appointment> findByDoctorAndAppointmentDateOrderByQueueNumberAsc(Doctor doctor, LocalDate date);

    List<Appointment> findByDoctorAndAppointmentDateAndStatusNotOrderByQueueNumberAsc(
            Doctor doctor, LocalDate date, Appointment.AppointmentStatus status);

    Optional<Integer> findMaxQueueNumberByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);

    @Query("SELECT MAX(a.queueNumber) FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date")
    Optional<Integer> findMaxQueueNumber(@Param("doctor") Doctor doctor, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countActiveAppointments(@Param("doctor") Doctor doctor, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED') ORDER BY a.queueNumber ASC")
    List<Appointment> findQueueForDoctor(@Param("doctor") Doctor doctor, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND a.reminderSent = false " +
           "AND a.createdAt <= :reminderTime")
    List<Appointment> findAppointmentsForReminder(@Param("date") LocalDate date,
                                                   @Param("reminderTime") LocalDateTime reminderTime);

    Page<Appointment> findByStatusOrderByAppointmentDateDescAppointmentTimeDesc(
            Appointment.AppointmentStatus status, Pageable pageable);
}

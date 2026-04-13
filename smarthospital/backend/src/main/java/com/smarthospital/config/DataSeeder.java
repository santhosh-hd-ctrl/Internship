package com.smarthospital.config;

import com.smarthospital.entity.*;
import com.smarthospital.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        log.info("Seeding initial data...");

        // Admin
        User admin = userRepository.save(User.builder()
                .email("admin@smarthospital.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .phone("+1-800-HOSPITAL")
                .role(User.Role.ADMIN)
                .build());

        // Doctors
        String[][] doctorData = {
            {"dr.sarah@smarthospital.com", "Dr. Sarah Mitchell", "Cardiology", "MD, FACC", "CARD-001", "Cardiology", "15"},
            {"dr.james@smarthospital.com", "Dr. James Chen", "Neurology", "MD, PhD", "NEUR-002", "Neurology", "12"},
            {"dr.priya@smarthospital.com", "Dr. Priya Sharma", "Pediatrics", "MD, FAAP", "PEDI-003", "Pediatrics", "8"},
            {"dr.michael@smarthospital.com", "Dr. Michael Torres", "Orthopedics", "MD, FAAOS", "ORTH-004", "Orthopedics", "20"},
            {"dr.emily@smarthospital.com", "Dr. Emily Watson", "Dermatology", "MD, FAAD", "DERM-005", "Dermatology", "10"},
        };

        for (String[] d : doctorData) {
            User docUser = userRepository.save(User.builder()
                    .email(d[0]).password(passwordEncoder.encode("doctor123"))
                    .fullName(d[1]).role(User.Role.DOCTOR).build());

            Doctor doctor = doctorRepository.save(Doctor.builder()
                    .user(docUser).specialization(d[2]).qualification(d[3])
                    .licenseNumber(d[4]).department(d[5])
                    .yearsOfExperience(Integer.parseInt(d[6]))
                    .consultationFee(150.0).appointmentDuration(20)
                    .maxDailyAppointments(20).available(true)
                    .bio("Experienced " + d[2] + " specialist with " + d[6] + " years of practice.").build());

            // Add schedules Mon-Fri
            DayOfWeek[] weekdays = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                                     DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};
            for (DayOfWeek day : weekdays) {
                scheduleRepository.save(DoctorSchedule.builder()
                        .doctor(doctor).dayOfWeek(day)
                        .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(17, 0))
                        .breakStartTime(LocalTime.of(13, 0)).breakEndTime(LocalTime.of(14, 0))
                        .isActive(true).build());
            }
            // Saturday morning
            scheduleRepository.save(DoctorSchedule.builder()
                    .doctor(doctor).dayOfWeek(DayOfWeek.SATURDAY)
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(13, 0))
                    .isActive(true).build());
        }

        // Sample patients
        String[][] patients = {
            {"patient1@example.com", "John Anderson", "+1-555-0101"},
            {"patient2@example.com", "Maria Garcia", "+1-555-0102"},
            {"patient3@example.com", "Robert Lee", "+1-555-0103"},
        };
        for (String[] p : patients) {
            userRepository.save(User.builder()
                    .email(p[0]).password(passwordEncoder.encode("patient123"))
                    .fullName(p[1]).phone(p[2]).role(User.Role.PATIENT).build());
        }

        log.info("Data seeding complete.");
        log.info("Admin: admin@smarthospital.com / admin123");
        log.info("Doctor: dr.sarah@smarthospital.com / doctor123");
        log.info("Patient: patient1@example.com / patient123");
    }
}

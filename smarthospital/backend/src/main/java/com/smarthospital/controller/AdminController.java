package com.smarthospital.controller;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.entity.User;
import com.smarthospital.repository.AppointmentRepository;
import com.smarthospital.repository.DoctorRepository;
import com.smarthospital.repository.UserRepository;
import com.smarthospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        long totalPatients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PATIENT).count();
        long totalDoctors = doctorRepository.count();

        AdminDashboardDto dashboard = AdminDashboardDto.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointmentsToday(appointmentRepository.findAll().stream()
                        .filter(a -> a.getAppointmentDate().equals(LocalDate.now())).count())
                .totalAppointmentsThisMonth(appointmentRepository.findAll().stream()
                        .filter(a -> a.getAppointmentDate().getMonth() == LocalDate.now().getMonth()).count())
                .pendingAppointments(appointmentRepository.findAll().stream()
                        .filter(a -> a.getStatus().name().equals("SCHEDULED")).count())
                .completedAppointments(appointmentRepository.findAll().stream()
                        .filter(a -> a.getStatus().name().equals("COMPLETED")).count())
                .cancelledAppointments(appointmentRepository.findAll().stream()
                        .filter(a -> a.getStatus().name().equals("CANCELLED")).count())
                .availableDoctors(doctorRepository.findByAvailableTrue().stream()
                        .map(doctorService::mapToDto).collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@RequestBody DoctorCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor created successfully",
                doctorService.createDoctor(request)));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctor(
            @PathVariable Long id, @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.updateDoctor(id, request)));
    }

    @PutMapping("/doctors/{id}/toggle-availability")
    public ResponseEntity<ApiResponse<Void>> toggleAvailability(@PathVariable Long id) {
        doctorService.toggleDoctorAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Availability toggled", null));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UserDto> patients = userRepository
                .findAll(PageRequest.of(page, size))
                .map(u -> UserDto.builder()
                        .id(u.getId()).email(u.getEmail()).fullName(u.getFullName())
                        .phone(u.getPhone()).role(u.getRole()).createdAt(u.getCreatedAt()).build())
                .map(u -> u);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }
}

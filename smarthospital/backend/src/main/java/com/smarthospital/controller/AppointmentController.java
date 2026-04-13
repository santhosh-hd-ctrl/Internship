package com.smarthospital.controller;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.entity.Appointment;
import com.smarthospital.entity.User;
import com.smarthospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User patient) {
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully",
                appointmentService.bookAppointment(request, patient)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<AppointmentDto>>> myAppointments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getPatientAppointments(user,
                        PageRequest.of(page, size, Sort.by("appointmentDate").descending()))));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<Page<AppointmentDto>>> doctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getDoctorAppointments(doctorId, PageRequest.of(page, size))));
    }

    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<ApiResponse<QueueStatusDto>> getQueue(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User user) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getQueueStatus(doctorId, queryDate, user.getId())));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
                appointmentService.cancelAppointment(id, reason, user)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam Appointment.AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                appointmentService.updateStatus(id, status)));
    }
}

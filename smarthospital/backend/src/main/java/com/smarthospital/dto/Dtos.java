package com.smarthospital.dto;

import com.smarthospital.entity.Appointment;
import com.smarthospital.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class Dtos {

    // ========== AUTH ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        @NotBlank private String fullName;
        private String phone;
        private User.Role role;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private UserDto user;
    }

    // ========== USER ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String profilePicture;
        private User.Role role;
        private LocalDateTime createdAt;
    }

    // ========== DOCTOR ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DoctorDto {
        private Long id;
        private Long userId;
        private String email;
        private String fullName;
        private String phone;
        private String specialization;
        private String qualification;
        private String licenseNumber;
        private String department;
        private Integer yearsOfExperience;
        private String bio;
        private boolean available;
        private int appointmentDuration;
        private int maxDailyAppointments;
        private Double consultationFee;
        private List<ScheduleDto> schedules;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DoctorCreateRequest {
        @NotBlank private String email;
        @NotBlank private String fullName;
        private String phone;
        @NotBlank private String specialization;
        private String qualification;
        private String licenseNumber;
        private String department;
        private Integer yearsOfExperience;
        private String bio;
        private Double consultationFee;
        private Integer appointmentDuration;
        private Integer maxDailyAppointments;
    }

    // ========== SCHEDULE ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ScheduleDto {
        private Long id;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private LocalTime breakStartTime;
        private LocalTime breakEndTime;
        private boolean isActive;
    }

    // ========== APPOINTMENT ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AppointmentRequest {
        @NotNull private Long doctorId;
        @NotNull private LocalDate appointmentDate;
        @NotNull private LocalTime appointmentTime;
        private String symptoms;
        private String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AppointmentDto {
        private Long id;
        private Long patientId;
        private String patientName;
        private String patientEmail;
        private String patientPhone;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private String department;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private Integer queueNumber;
        private Appointment.AppointmentStatus status;
        private String symptoms;
        private String notes;
        private String cancellationReason;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QueueStatusDto {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private LocalDate date;
        private Integer totalQueued;
        private Integer currentQueueNumber;
        private Integer yourQueueNumber;
        private Integer patientsAhead;
        private Integer estimatedWaitMinutes;
        private List<QueueItemDto> queue;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QueueItemDto {
        private Integer queueNumber;
        private String patientName;
        private LocalTime appointmentTime;
        private Appointment.AppointmentStatus status;
        private boolean isCurrentPatient;
    }

    // ========== NOTIFICATION ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationDto {
        private Long id;
        private String title;
        private String message;
        private String type;
        private boolean isRead;
        private LocalDateTime createdAt;
    }

    // ========== DASHBOARD ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdminDashboardDto {
        private long totalPatients;
        private long totalDoctors;
        private long totalAppointmentsToday;
        private long totalAppointmentsThisMonth;
        private long pendingAppointments;
        private long completedAppointments;
        private long cancelledAppointments;
        private List<DoctorDto> availableDoctors;
    }

    // ========== GENERIC ==========
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder().success(true).data(data).build();
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }
}

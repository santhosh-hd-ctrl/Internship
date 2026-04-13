package com.smarthospital.service;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.entity.Appointment;
import com.smarthospital.entity.Doctor;
import com.smarthospital.entity.Notification;
import com.smarthospital.entity.User;
import com.smarthospital.exception.BadRequestException;
import com.smarthospital.exception.ResourceNotFoundException;
import com.smarthospital.repository.AppointmentRepository;
import com.smarthospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional
    public AppointmentDto bookAppointment(AppointmentRequest request, User patient) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.isAvailable()) {
            throw new BadRequestException("Doctor is not available");
        }

        long activeCount = appointmentRepository.countActiveAppointments(doctor, request.getAppointmentDate());
        if (activeCount >= doctor.getMaxDailyAppointments()) {
            throw new BadRequestException("No more appointment slots available for this date");
        }

        Integer maxQueue = appointmentRepository.findMaxQueueNumber(doctor, request.getAppointmentDate()).orElse(0);
        int queueNumber = maxQueue + 1;

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .queueNumber(queueNumber)
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .build());

        // Notify patient
        notificationService.createNotification(patient,
                "Appointment Confirmed",
                String.format("Your appointment with %s is confirmed. Queue #%d on %s at %s",
                        doctor.getUser().getFullName(), queueNumber,
                        request.getAppointmentDate(), request.getAppointmentTime()),
                Notification.NotificationType.APPOINTMENT_BOOKED);

        // Push queue update via WebSocket
        broadcastQueueUpdate(doctor.getId(), request.getAppointmentDate());

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto cancelAppointment(Long appointmentId, String reason, User user) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        boolean isPatient = appointment.getPatient().getId().equals(user.getId());
        boolean isAdminOrDoctor = user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.DOCTOR;

        if (!isPatient && !isAdminOrDoctor) {
            throw new BadRequestException("Not authorized to cancel this appointment");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED ||
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel this appointment");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointmentRepository.save(appointment);

        notificationService.createNotification(appointment.getPatient(),
                "Appointment Cancelled",
                String.format("Your appointment with %s on %s has been cancelled.",
                        appointment.getDoctor().getUser().getFullName(), appointment.getAppointmentDate()),
                Notification.NotificationType.APPOINTMENT_CANCELLED);

        broadcastQueueUpdate(appointment.getDoctor().getId(), appointment.getAppointmentDate());

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto updateStatus(Long appointmentId, Appointment.AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);

        if (newStatus == Appointment.AppointmentStatus.IN_PROGRESS) {
            notificationService.createNotification(appointment.getPatient(),
                    "Your Turn!",
                    "The doctor is ready to see you now. Please proceed to the consultation room.",
                    Notification.NotificationType.QUEUE_UPDATE);
        }

        broadcastQueueUpdate(appointment.getDoctor().getId(), appointment.getAppointmentDate());
        return mapToDto(appointment);
    }

    public Page<AppointmentDto> getPatientAppointments(User patient, Pageable pageable) {
        return appointmentRepository
                .findByPatientOrderByAppointmentDateDescAppointmentTimeDesc(patient, pageable)
                .map(this::mapToDto);
    }

    public Page<AppointmentDto> getDoctorAppointments(Long doctorId, Pageable pageable) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return appointmentRepository
                .findByDoctorOrderByAppointmentDateAscAppointmentTimeAsc(doctor, pageable)
                .map(this::mapToDto);
    }

    public QueueStatusDto getQueueStatus(Long doctorId, LocalDate date, Long patientId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<Appointment> queue = appointmentRepository.findQueueForDoctor(doctor, date);
        int currentQueueNumber = queue.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.IN_PROGRESS)
                .mapToInt(Appointment::getQueueNumber).findFirst().orElse(0);

        Integer yourQueue = null;
        if (patientId != null) {
            yourQueue = queue.stream()
                    .filter(a -> a.getPatient().getId().equals(patientId))
                    .mapToInt(Appointment::getQueueNumber).findFirst().orElse(0);
            if (yourQueue == 0) yourQueue = null;
        }

        final Integer finalYourQueue = yourQueue;

        int patientsAhead = finalYourQueue != null
                ? (int) queue.stream().filter(a -> a.getQueueNumber() < finalYourQueue &&
                (a.getStatus() == Appointment.AppointmentStatus.SCHEDULED ||
                        a.getStatus() == Appointment.AppointmentStatus.CONFIRMED)).count()
                : 0;

        List<QueueItemDto> queueItems = queue.stream().map(a -> QueueItemDto.builder()
                .queueNumber(a.getQueueNumber())
                .patientName(maskName(a.getPatient().getFullName()))
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .isCurrentPatient(a.getStatus() == Appointment.AppointmentStatus.IN_PROGRESS)
                .build()).collect(Collectors.toList());

        return QueueStatusDto.builder()
                .doctorId(doctorId)
                .doctorName(doctor.getUser().getFullName())
                .specialization(doctor.getSpecialization())
                .date(date)
                .totalQueued(queue.size())
                .currentQueueNumber(currentQueueNumber)
                .yourQueueNumber(yourQueue)
                .patientsAhead(patientsAhead)
                .estimatedWaitMinutes(patientsAhead * doctor.getAppointmentDuration())
                .queue(queueItems)
                .build();
    }

    private void broadcastQueueUpdate(Long doctorId, LocalDate date) {
        try {
            QueueStatusDto status = getQueueStatus(doctorId, date, null);
            messagingTemplate.convertAndSend("/topic/queue/" + doctorId, status);
        } catch (Exception e) {
            log.error("Failed to broadcast queue update: {}", e.getMessage());
        }
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isEmpty()) return "***";
        String[] parts = fullName.split(" ");
        StringBuilder masked = new StringBuilder();
        for (String part : parts) {
            if (part.length() > 1) masked.append(part.charAt(0)).append("***").append(" ");
            else masked.append(part).append(" ");
        }
        return masked.toString().trim();
    }

    public AppointmentDto mapToDto(Appointment a) {
        return AppointmentDto.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getFullName())
                .patientEmail(a.getPatient().getEmail())
                .patientPhone(a.getPatient().getPhone())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .specialization(a.getDoctor().getSpecialization())
                .department(a.getDoctor().getDepartment())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .queueNumber(a.getQueueNumber())
                .status(a.getStatus())
                .symptoms(a.getSymptoms())
                .notes(a.getNotes())
                .cancellationReason(a.getCancellationReason())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
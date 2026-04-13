package com.smarthospital.scheduler;

import com.smarthospital.entity.Appointment;
import com.smarthospital.entity.Notification;
import com.smarthospital.repository.AppointmentRepository;
import com.smarthospital.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Value("${app.scheduler.reminder-minutes-before:30}")
    private int reminderMinutesBefore;

    // Run every 15 minutes
    @Scheduled(fixedDelay = 900000)
    public void sendAppointmentReminders() {
        log.info("Running appointment reminder scheduler...");

        LocalDate today = LocalDate.now();
        LocalDateTime reminderThreshold = LocalDateTime.now().plusMinutes(reminderMinutesBefore);

        List<Appointment> upcoming = appointmentRepository
                .findAppointmentsForReminder(today, reminderThreshold);

        for (Appointment appointment : upcoming) {
            try {
                notificationService.createNotification(
                        appointment.getPatient(),
                        "Appointment Reminder",
                        String.format("Reminder: Your appointment with %s is in %d minutes at %s. Queue #%d",
                                appointment.getDoctor().getUser().getFullName(),
                                reminderMinutesBefore,
                                appointment.getAppointmentTime(),
                                appointment.getQueueNumber()),
                        Notification.NotificationType.APPOINTMENT_REMINDER
                );

                appointment.setReminderSent(true);
                appointmentRepository.save(appointment);
                log.info("Reminder sent for appointment ID: {}", appointment.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment {}: {}", appointment.getId(), e.getMessage());
            }
        }
    }

    // Run daily at midnight to mark no-shows
    @Scheduled(cron = "0 0 0 * * *")
    public void markNoShows() {
        log.info("Marking no-show appointments...");
        LocalDate yesterday = LocalDate.now().minusDays(1);

        List<Appointment> scheduled = appointmentRepository
                .findByDoctorAndAppointmentDateAndStatusNotOrderByQueueNumberAsc(
                        null, yesterday, Appointment.AppointmentStatus.CANCELLED);
        // Logic to check which scheduled appointments from yesterday were never completed
        // would go here in a production system
    }
}

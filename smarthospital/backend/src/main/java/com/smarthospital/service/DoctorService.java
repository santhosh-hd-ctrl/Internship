package com.smarthospital.service;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.entity.Doctor;
import com.smarthospital.entity.DoctorSchedule;
import com.smarthospital.entity.User;
import com.smarthospital.exception.BadRequestException;
import com.smarthospital.exception.ResourceNotFoundException;
import com.smarthospital.repository.DoctorRepository;
import com.smarthospital.repository.DoctorScheduleRepository;
import com.smarthospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<DoctorDto> getAllDoctors(Pageable pageable) {
        return doctorRepository.findByAvailableTrue(pageable).map(this::mapToDto);
    }

    public Page<DoctorDto> searchDoctors(String keyword, Pageable pageable) {
        return doctorRepository.searchDoctors(keyword, pageable).map(this::mapToDto);
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto createDoctor(DoctorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = userRepository.save(User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode("doctor123"))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.Role.DOCTOR)
                .build());

        Doctor doctor = doctorRepository.save(Doctor.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .licenseNumber(request.getLicenseNumber())
                .department(request.getDepartment())
                .yearsOfExperience(request.getYearsOfExperience())
                .bio(request.getBio())
                .consultationFee(request.getConsultationFee())
                .appointmentDuration(request.getAppointmentDuration() != null ? request.getAppointmentDuration() : 20)
                .maxDailyAppointments(request.getMaxDailyAppointments() != null ? request.getMaxDailyAppointments() : 20)
                .available(true)
                .build());

        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto updateDoctor(Long id, DoctorCreateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setDepartment(request.getDepartment());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());

        User user = doctor.getUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        return mapToDto(doctorRepository.save(doctor));
    }

    public void toggleDoctorAvailability(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setAvailable(!doctor.isAvailable());
        doctorRepository.save(doctor);
    }

    public List<ScheduleDto> getDoctorSchedule(Long doctorId) {
        return scheduleRepository.findByDoctorIdAndIsActiveTrue(doctorId)
                .stream().map(this::mapScheduleToDto).collect(Collectors.toList());
    }

    public DoctorDto mapToDto(Doctor doctor) {
        List<ScheduleDto> schedules = scheduleRepository
                .findByDoctorIdAndIsActiveTrue(doctor.getId())
                .stream().map(this::mapScheduleToDto).collect(Collectors.toList());

        return DoctorDto.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .email(doctor.getUser().getEmail())
                .fullName(doctor.getUser().getFullName())
                .phone(doctor.getUser().getPhone())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .licenseNumber(doctor.getLicenseNumber())
                .department(doctor.getDepartment())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .bio(doctor.getBio())
                .available(doctor.isAvailable())
                .appointmentDuration(doctor.getAppointmentDuration())
                .maxDailyAppointments(doctor.getMaxDailyAppointments())
                .consultationFee(doctor.getConsultationFee())
                .schedules(schedules)
                .build();
    }

    private ScheduleDto mapScheduleToDto(DoctorSchedule s) {
        return ScheduleDto.builder()
                .id(s.getId())
                .dayOfWeek(s.getDayOfWeek().name())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .breakStartTime(s.getBreakStartTime())
                .breakEndTime(s.getBreakEndTime())
                .isActive(s.isActive())
                .build();
    }
}

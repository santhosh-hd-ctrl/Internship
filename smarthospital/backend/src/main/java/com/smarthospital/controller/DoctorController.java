package com.smarthospital.controller;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("user.fullName"));
        Page<DoctorDto> doctors = (search != null && !search.isBlank())
                ? doctorService.searchDoctors(search, pageable)
                : doctorService.getAllDoctors(pageable);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorSchedule(id)));
    }
}

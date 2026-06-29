package com.billjoy.controller;

import com.billjoy.dto.AuditLogDto;
import com.billjoy.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AuditLogDto>> getMyActivity(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(activityService.getMyActivity(userDetails.getUsername()));
    }
}

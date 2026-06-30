package com.billjoy.controller;

import com.billjoy.repository.UserRepository;
import com.billjoy.service.DatabaseDiagnosticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DatabaseDebugController {

    private static final String ADMIN_EMAIL = "admin@billstack.com";
    private static final String TEST_EMAIL = "test@billstack.com";

    private final DatabaseDiagnosticsService diagnosticsService;
    private final UserRepository userRepository;

    @GetMapping("/database")
    public DatabaseDebugResponse database() {
        return new DatabaseDebugResponse(
                diagnosticsService.activeProfiles(),
                diagnosticsService.databaseHost(),
                diagnosticsService.tables(),
                userRepository.count(),
                userRepository.existsByEmail(ADMIN_EMAIL),
                userRepository.existsByEmail(TEST_EMAIL));
    }

    public record DatabaseDebugResponse(
            String profile,
            String database,
            List<String> tables,
            long userCount,
            boolean adminExists,
            boolean testExists) {
    }
}

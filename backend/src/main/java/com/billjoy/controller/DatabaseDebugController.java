package com.billjoy.controller;

import com.billjoy.repository.UserRepository;
import com.billjoy.service.DatabaseDiagnosticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.debug.database.enabled:false}")
    private boolean databaseDebugEnabled;

    @GetMapping("/database")
    public Object database() {
        if (!databaseDebugEnabled) {
            return new DatabaseDebugDisabledResponse(false, "Database debug output is disabled.");
        }

        return new DatabaseDebugResponse(
                diagnosticsService.activeProfiles(),
                diagnosticsService.databaseHost(),
                diagnosticsService.databaseName(),
                diagnosticsService.databaseProductName(),
                diagnosticsService.isConnected(),
                diagnosticsService.tables(),
                userCount(),
                userExists(ADMIN_EMAIL),
                userExists(TEST_EMAIL));
    }

    public record DatabaseDebugResponse(
            String profile,
            String database,
            String databaseName,
            String databaseProduct,
            boolean databaseConnected,
            List<String> tables,
            long userCount,
            boolean adminExists,
            boolean testExists) {
    }

    public record DatabaseDebugDisabledResponse(
            boolean enabled,
            String message) {
    }

    private long userCount() {
        try {
            return userRepository.count();
        } catch (Exception ex) {
            return -1;
        }
    }

    private boolean userExists(String email) {
        try {
            return userRepository.existsByEmailIgnoreCase(email);
        } catch (Exception ex) {
            return false;
        }
    }
}

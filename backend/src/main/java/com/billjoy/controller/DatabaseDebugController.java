package com.billjoy.controller;

import com.billjoy.repository.UserRepository;
import com.billjoy.service.DatabaseDiagnosticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.debug.database.enabled", havingValue = "true")
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

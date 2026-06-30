package com.billjoy.config;

import com.billjoy.repository.UserRepository;
import com.billjoy.service.DatabaseDiagnosticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupDiagnosticsLogger {

    private static final String ADMIN_EMAIL = "admin@billstack.com";
    private static final String TEST_EMAIL = "test@billstack.com";

    private final DatabaseDiagnosticsService diagnosticsService;
    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void logApplicationReady() {
        log.info("Application ready");
        log.info("Startup diagnostics: active profile={}", diagnosticsService.activeProfiles());
        log.info("Startup diagnostics: database host={}, name={}, product={}, connected={}",
                diagnosticsService.databaseHost(),
                diagnosticsService.databaseName(),
                diagnosticsService.databaseProductName(),
                diagnosticsService.isConnected());
        try {
            log.info("Startup diagnostics: total users={}", userRepository.count());
            log.info("Startup diagnostics: admin exists={}", userRepository.existsByEmailIgnoreCase(ADMIN_EMAIL));
            log.info("Startup diagnostics: test exists={}", userRepository.existsByEmailIgnoreCase(TEST_EMAIL));
        } catch (Exception ex) {
            log.warn("Startup diagnostics: user repository check failed after startup: {}", ex.getMessage());
        }
    }
}

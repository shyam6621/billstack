package com.billjoy.config;

import com.billjoy.model.*;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.UserRepository;
import com.billjoy.service.DatabaseDiagnosticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String TEST_USER_EMAIL = "test@billstack.com";
    private static final String ADMIN_USER_EMAIL = "admin@billstack.com";

    @org.springframework.beans.factory.annotation.Value("${app.seeder.enabled:true}")
    private boolean seederEnabled;

    @org.springframework.beans.factory.annotation.Value("${app.seeder.test-user-password:password}")
    private String testUserPassword;

    @org.springframework.beans.factory.annotation.Value("${app.seeder.admin-password:admin123}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;
    private final DatabaseDiagnosticsService diagnosticsService;

    @Override
    public void run(String... args) {
        runWithRetry();
    }

    private void runWithRetry() {
        int maxAttempts = 5;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                runSeederOnce();
                return;
            } catch (Exception ex) {
                log.warn("DataSeeder attempt {}/{} failed: {}", attempt, maxAttempts, ex.getMessage());
                if (attempt == maxAttempts) {
                    log.error("DataSeeder could not complete after {} attempts. Application will continue running.", maxAttempts, ex);
                    return;
                }
                sleepBeforeRetry();
            }
        }
    }

    private void runSeederOnce() {
        log.info("Startup diagnostics: active profile={}", diagnosticsService.activeProfiles());
        log.info("Startup diagnostics: database host={}, name={}, product={}, connected={}",
                diagnosticsService.databaseHost(),
                diagnosticsService.databaseName(),
                diagnosticsService.databaseProductName(),
                diagnosticsService.isConnected());
        log.info("Startup diagnostics: seeder enabled={}", seederEnabled);

        long usersBeforeSeeding = userRepository.count();
        log.info("Startup diagnostics: users before seeding={}", usersBeforeSeeding);
        log.info("Startup diagnostics: admin exists before seeding={}", userRepository.existsByEmailIgnoreCase(ADMIN_USER_EMAIL));
        log.info("Startup diagnostics: test user exists before seeding={}", userRepository.existsByEmailIgnoreCase(TEST_USER_EMAIL));

        if (!seederEnabled) {
            log.warn("DataSeeder is disabled by app.seeder.enabled=false. Skipping seed safely.");
            verifyRequiredUsers("DataSeeder is disabled");
            return;
        }

        ensureUser(ADMIN_USER_EMAIL, "Admin", adminPassword, Role.ADMIN);
        User testUser = ensureUser(TEST_USER_EMAIL, "Test User", testUserPassword, Role.USER);

        if (billRepository.count() == 0) {
            log.info("Database has no bills - seeding demo bills for {}", TEST_USER_EMAIL);
            List<Bill> demoBills = List.of(
                    createBill(testUser, BillType.ELECTRICITY, "Monthly Electricity", BigDecimal.valueOf(150.50),
                            LocalDate.now().plusDays(5)),
                    createBill(testUser, BillType.WATER, "Water Bill", BigDecimal.valueOf(45.00),
                            LocalDate.now().plusDays(10)),
                    createBill(testUser, BillType.INTERNET, "Broadband Internet", BigDecimal.valueOf(89.99),
                            LocalDate.now().plusDays(15)),
                    createBill(testUser, BillType.CREDIT_CARD, "Credit Card Minimum", BigDecimal.valueOf(500.00),
                            LocalDate.now().plusDays(2)),
                    createBill(testUser, BillType.RENT, "Apartment Rent", BigDecimal.valueOf(1200.00),
                            LocalDate.now().plusDays(1)));
            billRepository.saveAll(demoBills);
        } else {
            log.debug("Skipping bill seed - {} bill(s) already exist", billRepository.count());
        }

        verifyRequiredUsers("DataSeeder completed");
    }

    private User ensureUser(String email, String name, String rawPassword, Role role) {
        return userRepository.findByEmailIgnoreCase(email).map(existingUser -> {
            boolean changed = false;
            if (existingUser.getRole() != role) {
                existingUser.setRole(role);
                changed = true;
            }
            if (!name.equals(existingUser.getName())) {
                existingUser.setName(name);
                changed = true;
            }
            if (existingUser.getPassword() == null || !passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
                log.warn("Repairing password hash for required account {}", email);
                existingUser.setPassword(passwordEncoder.encode(rawPassword));
                changed = true;
            }
            if (changed) {
                log.info("Updated required account {}", email);
                return userRepository.save(existingUser);
            }
            log.info("Required account already exists: {}", email);
            return existingUser;
        }).orElseGet(() -> {
            log.info("Creating required account {}", email);
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .build();
            return userRepository.save(user);
        });
    }

    private Bill createBill(User user, BillType type, String desc, BigDecimal amount, LocalDate dueDate) {
        Bill bill = new Bill();
        bill.setUser(user);
        bill.setBillType(type);
        bill.setDescription(desc);
        bill.setAmount(amount);
        bill.setDueDate(dueDate);
        bill.setStatus(BillStatus.PENDING);
        return bill;
    }

    private void verifyRequiredUsers(String stage) {
        long usersAfterSeeding = userRepository.count();
        boolean adminExists = userRepository.existsByEmailIgnoreCase(ADMIN_USER_EMAIL);
        boolean testExists = userRepository.existsByEmailIgnoreCase(TEST_USER_EMAIL);

        log.info("Startup diagnostics: {} - users after seeding={}", stage, usersAfterSeeding);
        log.info("Startup diagnostics: {} - admin exists={}", stage, adminExists);
        log.info("Startup diagnostics: {} - test user exists={}", stage, testExists);
        log.info("Startup diagnostics: application ready for traffic. Seeder completed or skipped safely.");

        if (!adminExists || !testExists) {
            log.warn("Required seed users are missing. adminExists={}, testExists={}, users={}, profile={}, database={}",
                    adminExists, testExists, usersAfterSeeding, diagnosticsService.activeProfiles(), diagnosticsService.databaseHost());
        }
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("DataSeeder retry wait interrupted. Application will continue startup.");
        }
    }
}

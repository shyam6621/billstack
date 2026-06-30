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
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public void run(String... args) {
        log.info("Startup diagnostics: active profile={}", diagnosticsService.activeProfiles());
        log.info("Startup diagnostics: database host={}, product={}",
                diagnosticsService.databaseHost(), diagnosticsService.databaseProductName());
        verifyProductionDatabase();

        long usersBeforeSeeding = userRepository.count();
        log.info("Startup diagnostics: users before seeding={}", usersBeforeSeeding);
        log.info("Startup diagnostics: admin exists before seeding={}", userRepository.existsByEmail(ADMIN_USER_EMAIL));
        log.info("Startup diagnostics: test user exists before seeding={}", userRepository.existsByEmail(TEST_USER_EMAIL));

        if (!seederEnabled) {
            log.warn("DataSeeder is disabled by app.seeder.enabled=false. Required login accounts will not be created.");
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
        return userRepository.findByEmail(email).map(existingUser -> {
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
        boolean adminExists = userRepository.existsByEmail(ADMIN_USER_EMAIL);
        boolean testExists = userRepository.existsByEmail(TEST_USER_EMAIL);

        log.info("Startup diagnostics: {} - users after seeding={}", stage, usersAfterSeeding);
        log.info("Startup diagnostics: {} - admin exists={}", stage, adminExists);
        log.info("Startup diagnostics: {} - test user exists={}", stage, testExists);

        if (!adminExists || !testExists) {
            throw new IllegalStateException(
                    "Required login accounts were not created. adminExists=" + adminExists
                            + ", testExists=" + testExists
                            + ", users=" + usersAfterSeeding
                            + ", profile=" + diagnosticsService.activeProfiles()
                            + ", database=" + diagnosticsService.databaseHost());
        }
    }

    private void verifyProductionDatabase() {
        String activeProfiles = diagnosticsService.activeProfiles().toLowerCase();
        if (!activeProfiles.contains("prod")) {
            return;
        }

        String databaseProduct = diagnosticsService.databaseProductName().toLowerCase();
        if (databaseProduct.contains("h2") || !(databaseProduct.contains("mysql") || databaseProduct.contains("mariadb"))) {
            throw new IllegalStateException(
                    "Production profile must connect to Railway MySQL/MariaDB, but connected database product is "
                            + diagnosticsService.databaseProductName()
                            + " at " + diagnosticsService.databaseHost());
        }
    }
}

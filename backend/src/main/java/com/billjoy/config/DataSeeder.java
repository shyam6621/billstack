package com.billjoy.config;

import com.billjoy.model.*;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.UserRepository;
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

    private static final String TEST_USER_EMAIL = "test@billjoy.com";
    private static final String ADMIN_USER_EMAIL = "admin@billjoy.com";

    @org.springframework.beans.factory.annotation.Value("${app.seeder.enabled:true}")
    private boolean seederEnabled;

    @org.springframework.beans.factory.annotation.Value("${app.seeder.test-user-password:password}")
    private String testUserPassword;

    @org.springframework.beans.factory.annotation.Value("${app.seeder.admin-password:admin123}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!seederEnabled) {
            log.info("Data seeding is disabled. Skipping database seed...");
            return;
        }

        User testUser = ensureUser(TEST_USER_EMAIL, "Test User", testUserPassword, Role.USER);
        ensureUser(ADMIN_USER_EMAIL, "Admin User", adminPassword, Role.ADMIN);

        if (billRepository.count() == 0) {
            log.info("Database has no bills — seeding demo bills for {}", TEST_USER_EMAIL);
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
            log.debug("Skipping bill seed — {} bill(s) already exist", billRepository.count());
        }
    }

    private User ensureUser(String email, String name, String rawPassword, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Seeding user {}", email);
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
}

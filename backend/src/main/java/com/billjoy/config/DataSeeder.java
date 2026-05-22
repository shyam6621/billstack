package com.billjoy.config;

import com.billjoy.model.*;
import com.billjoy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (billRepository.count() == 0) {
            User targetUser = userRepository.findAll().stream().findFirst().orElseGet(() -> {
                User u = User.builder()
                        .name("Test User")
                        .email("test@billjoy.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .build();
                return userRepository.save(u);
            });

            User adminUser = userRepository.findByEmail("admin@billjoy.com").orElseGet(() -> {
                User u = User.builder()
                        .name("Admin User")
                        .email("admin@billjoy.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();
                return userRepository.save(u);
            });

            // Create 5 pending bills for targetUser
            List<Bill> dummyBills = List.of(
                    createBill(targetUser, BillType.ELECTRICITY, "Monthly Electricity", BigDecimal.valueOf(150.50),
                            LocalDate.now().plusDays(5)),
                    createBill(targetUser, BillType.WATER, "Water Bill", BigDecimal.valueOf(45.00),
                            LocalDate.now().plusDays(10)),
                    createBill(targetUser, BillType.INTERNET, "Broadband Internet", BigDecimal.valueOf(89.99),
                            LocalDate.now().plusDays(15)),
                    createBill(targetUser, BillType.CREDIT_CARD, "Credit Card Minimum", BigDecimal.valueOf(500.00),
                            LocalDate.now().plusDays(2)),
                    createBill(targetUser, BillType.RENT, "Apartment Rent", BigDecimal.valueOf(1200.00),
                            LocalDate.now().plusDays(1)));
            billRepository.saveAll(dummyBills);
        }
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

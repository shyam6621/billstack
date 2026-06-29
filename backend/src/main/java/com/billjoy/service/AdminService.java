package com.billjoy.service;

import com.billjoy.dto.*;
import com.billjoy.model.FraudAlert;
import com.billjoy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActivityService activityService;

    public long getUserCount() {
        return userRepository.count();
    }

    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUserRoles() {
        return userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of("user_id", u.getId(), "role", u.getRole().name()))
                .collect(Collectors.toList());
    }

    public List<BillDto> getBills() {
        return billRepository.findAll().stream()
                .map(BillDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPayments() {
        return paymentRepository.findAllWithDetailsOrderByPaymentDateDesc()
                .stream()
                .map(PaymentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PaymentDto> getTransactions(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(PaymentDto::fromEntity);
    }

    public Page<FraudAlertDto> getFraudAlerts(Pageable pageable) {
        return fraudAlertRepository.findByResolvedFalseOrderByCreatedAtDesc(pageable)
                .map(FraudAlertDto::fromEntity);
    }

    public FraudAlertDto resolveFraudAlert(String id) {
        FraudAlert alert = fraudAlertRepository.findById(id).orElseThrow();
        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        return FraudAlertDto.fromEntity(fraudAlertRepository.save(alert));
    }

    public List<AuditLogDto> getAuditLogs() {
        return activityService.getAllActivityLogs();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalBills = billRepository.count();
        long pendingBills = billRepository.findByStatus(com.billjoy.model.BillStatus.PENDING).size();
        java.math.BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentStatus() == com.billjoy.model.PaymentStatus.SUCCESS)
                .map(com.billjoy.model.Payment::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return Map.of(
                "totalUsers", totalUsers,
                "totalBills", totalBills,
                "pendingBills", pendingBills,
                "totalRevenue", totalRevenue
        );
    }

    public List<Map<String, Object>> getMonthlyRevenue() {
        Map<String, java.math.BigDecimal> revenueByMonth = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentStatus() == com.billjoy.model.PaymentStatus.SUCCESS && p.getPaymentDate() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentDate().getMonth().name().substring(0, 3), // "JAN", "FEB"
                        Collectors.mapping(com.billjoy.model.Payment::getAmount, Collectors.reducing(java.math.BigDecimal.ZERO, java.math.BigDecimal::add))
                ));

        return revenueByMonth.entrySet().stream()
                .map(e -> Map.<String, Object>of("month", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPaymentMethodsStat() {
        Map<String, Long> methodCounts = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentStatus() == com.billjoy.model.PaymentStatus.SUCCESS && p.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentMethod().name(),
                        Collectors.counting()
                ));

        return methodCounts.entrySet().stream()
                .map(e -> Map.<String, Object>of("name", e.getKey().replace("_", " "), "value", e.getValue()))
                .collect(Collectors.toList());
    }

    public List<BillDto> getPendingBills() {
         return billRepository.findByStatus(com.billjoy.model.BillStatus.PENDING).stream()
                .map(BillDto::fromEntity)
                .collect(Collectors.toList());
    }
}

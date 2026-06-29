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
        return paymentRepository.findAllWithDetails(pageable)
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
        long pendingBills = billRepository.countByStatus(com.billjoy.model.BillStatus.PENDING);
        java.math.BigDecimal totalRevenue = paymentRepository.sumAmountByPaymentStatus(com.billjoy.model.PaymentStatus.SUCCESS);
        if (totalRevenue == null) {
            totalRevenue = java.math.BigDecimal.ZERO;
        }

        return Map.of(
                "totalUsers", totalUsers,
                "totalBills", totalBills,
                "pendingBills", pendingBills,
                "totalRevenue", totalRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyRevenue() {
        List<Object[]> results = paymentRepository.findSuccessPaymentDatesAndAmounts(com.billjoy.model.PaymentStatus.SUCCESS);
        Map<String, java.math.BigDecimal> revenueByMonth = results.stream()
                .filter(arr -> arr[0] != null && arr[1] != null)
                .collect(Collectors.groupingBy(
                        arr -> ((java.time.LocalDateTime) arr[0]).getMonth().name().substring(0, 3),
                        Collectors.mapping(arr -> (java.math.BigDecimal) arr[1], Collectors.reducing(java.math.BigDecimal.ZERO, java.math.BigDecimal::add))
                ));

        return revenueByMonth.entrySet().stream()
                .map(e -> Map.<String, Object>of("month", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPaymentMethodsStat() {
        List<Object[]> results = paymentRepository.countPaymentsByMethod(com.billjoy.model.PaymentStatus.SUCCESS);
        return results.stream()
                .filter(arr -> arr[0] != null)
                .map(arr -> Map.<String, Object>of("name", arr[0].toString().replace("_", " "), "value", arr[1]))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BillDto> getPendingBills() {
         return billRepository.findByStatusWithUser(com.billjoy.model.BillStatus.PENDING).stream()
                .map(BillDto::fromEntity)
                .collect(Collectors.toList());
    }
}

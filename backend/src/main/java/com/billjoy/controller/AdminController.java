package com.billjoy.controller;

import com.billjoy.dto.*;
import com.billjoy.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users/count")
    public ResponseEntity<Map<String, Long>> getUserCount() {
        return ResponseEntity.ok(Map.of("count", adminService.getUserCount()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @GetMapping("/user-roles")
    public ResponseEntity<List<Map<String, Object>>> getUserRoles() {
        return ResponseEntity.ok(adminService.getUserRoles());
    }

    @GetMapping("/bills")
    public ResponseEntity<List<BillDto>> getBills() {
        return ResponseEntity.ok(adminService.getBills());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDto>> getPayments() {
        return ResponseEntity.ok(adminService.getPayments());
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<PaymentDto>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity
                .ok(adminService.getTransactions(PageRequest.of(page, size, Sort.by("paymentDate").descending())));
    }

    @GetMapping("/fraud-alerts")
    public ResponseEntity<Map<String, List<FraudAlertDto>>> getFraudAlerts() {
        // Return first 50 unresolved
        return ResponseEntity.ok(Map.of("alerts",
                adminService.getFraudAlerts(PageRequest.of(0, 50)).getContent()));
    }

    @PutMapping("/fraud-alerts/{id}/resolve")
    public ResponseEntity<FraudAlertDto> resolveFraudAlert(@PathVariable String id) {
        return ResponseEntity.ok(adminService.resolveFraudAlert(id));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue() {
        return ResponseEntity.ok(adminService.getMonthlyRevenue());
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<Map<String, Object>>> getPaymentMethodsStat() {
        return ResponseEntity.ok(adminService.getPaymentMethodsStat());
    }

    @GetMapping("/pending-bills")
    public ResponseEntity<List<BillDto>> getPendingBills() {
        return ResponseEntity.ok(adminService.getPendingBills());
    }
}

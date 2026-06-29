package com.billjoy.service;

import com.billjoy.dto.PayBillRequest;
import com.billjoy.dto.PaymentDto;
import com.billjoy.exception.BillAlreadyPaidException;
import com.billjoy.exception.BillNotFoundException;
import com.billjoy.exception.UnauthorizedBillAccessException;
import com.billjoy.model.*;
import com.billjoy.repository.AuditLogRepository;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.NotificationRepository;
import com.billjoy.repository.PaymentRepository;
import com.billjoy.repository.UserRepository;
import com.billjoy.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final FraudAlertRepository fraudAlertRepository;

    @Transactional
    public PaymentDto processPayment(String email, PayBillRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getIdempotencyKey() != null) {
            Optional<Payment> existing = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Idempotent request matched. Returning existing transaction ID: {}", existing.get().getTransactionId());
                return PaymentDto.fromEntity(existing.get());
            }
        }

        // Acquire a pessimistic write lock to prevent double payments under high concurrency
        Bill bill = billRepository.findByIdWithUserForUpdate(request.getBillId())
                .orElseThrow(() -> new BillNotFoundException(request.getBillId()));

        if (!bill.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedBillAccessException();
        }

        if (bill.getStatus() == BillStatus.PAID) {
            throw new BillAlreadyPaidException(bill.getId());
        }

        paymentRepository.findByBillIdAndPaymentStatus(bill.getId(), PaymentStatus.SUCCESS)
                .ifPresent(existing -> {
                    throw new BillAlreadyPaidException(bill.getId());
                });

        // 1. Check velocity fraud alert (more than 3 successful payments in 2 minutes)
        LocalDateTime since = LocalDateTime.now().minusMinutes(2);
        long recentPaymentsCount = paymentRepository.countPaymentsByUserAndStatusSince(user.getId(), PaymentStatus.SUCCESS, since);
        if (recentPaymentsCount >= 3) {
            FraudAlert velocityAlert = FraudAlert.builder()
                    .user(user)
                    .alertType("VELOCITY")
                    .severity("HIGH")
                    .description("User has made " + (recentPaymentsCount + 1) + " successful payments in the last 2 minutes.")
                    .resolved(false)
                    .build();
            fraudAlertRepository.save(velocityAlert);
            log.warn("Velocity fraud alert created for user: {}", user.getEmail());
        }

        // 2. Check amount anomaly fraud alert (amount > ₹10,000)
        if (bill.getAmount().compareTo(new java.math.BigDecimal("10000")) > 0) {
            String severity = bill.getAmount().compareTo(new java.math.BigDecimal("50000")) > 0 ? "HIGH" : "MEDIUM";
            FraudAlert amountAlert = FraudAlert.builder()
                    .user(user)
                    .alertType("AMOUNT_ANOMALY")
                    .severity(severity)
                    .description("High amount transaction of ₹" + bill.getAmount() + " detected.")
                    .resolved(false)
                    .build();
            fraudAlertRepository.save(amountAlert);
            log.warn("Amount anomaly fraud alert created for user: {} with amount: ₹{}", user.getEmail(), bill.getAmount());
        }

        Payment payment = Payment.builder()
                .user(user)
                .bill(bill)
                .amount(bill.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .idempotencyKey(request.getIdempotencyKey())
                .build();
        payment = paymentRepository.save(payment);

        bill.setStatus(BillStatus.PAID);
        billRepository.save(bill);

        Notification notification = Notification.builder()
                .user(user)
                .title("Payment Successful")
                .message(bill.getBillType().name() + " bill payment of ₹" + bill.getAmount() + " was successful.")
                .type("SUCCESS")
                .read(false)
                .entityType("PAYMENT")
                .entityId(payment.getId())
                .build();
        notificationRepository.save(notification);

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action("PAYMENT_SUCCESS")
                .entityType("PAYMENT")
                .entityId(payment.getId())
                .details("{\"amount\":" + bill.getAmount()
                        + ",\"bill_type\":\"" + bill.getBillType().name()
                        + "\",\"payment_method\":\"" + request.getPaymentMethod().name()
                        + "\",\"transaction_id\":\"" + payment.getTransactionId() + "\"}")
                .build();
        auditLogRepository.save(auditLog);

        log.info("Payment processed: user={}, bill={}, payment={}, transaction={}",
                user.getEmail(), bill.getId(), payment.getId(), payment.getTransactionId());

        return PaymentDto.fromEntity(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getMyPayments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return paymentRepository.findByUserIdWithDetailsOrderByPaymentDateDesc(user.getId())
                .stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAllWithDetailsOrderByPaymentDateDesc()
                .stream()
                .map(PaymentDto::fromEntity)
                .toList();
    }
}

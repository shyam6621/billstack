package com.billjoy.service;

import com.billjoy.dto.PayBillRequest;
import com.billjoy.dto.PaymentDto;
import com.billjoy.model.*;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.PaymentRepository;
import com.billjoy.repository.UserRepository;
import com.billjoy.repository.NotificationRepository;
import com.billjoy.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public PaymentDto processPayment(String email, PayBillRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new RuntimeException("Bill is already paid");
        }

        // Logic for idempotency key could be added here if there was a separate
        // idempotency table.
        // For simplicity, we just process.

        Payment payment = Payment.builder()
                .user(user)
                .bill(bill)
                .amount(bill.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
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
                .action("PAYMENT_COMPLETED")
                .entityType("PAYMENT")
                .entityId(payment.getId())
                .details("Paid ₹" + bill.getAmount() + " via " + request.getPaymentMethod())
                .build();
        auditLogRepository.save(auditLog);

        return PaymentDto.fromEntity(payment);
    }

    public List<PaymentDto> getMyPayments(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return paymentRepository.findByUserIdOrderByPaymentDateDesc(user.getId())
                .stream()
                .map(PaymentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentDto::fromEntity)
                .collect(Collectors.toList());
    }
}

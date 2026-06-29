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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public PaymentDto processPayment(String email, PayBillRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Bill bill = billRepository.findByIdWithUser(request.getBillId())
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

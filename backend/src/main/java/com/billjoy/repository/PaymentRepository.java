package com.billjoy.repository;

import com.billjoy.model.Payment;
import com.billjoy.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByUserIdOrderByPaymentDateDesc(String userId);

    List<Payment> findByPaymentStatusOrderByPaymentDateAsc(PaymentStatus status);
}

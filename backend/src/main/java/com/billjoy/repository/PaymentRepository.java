package com.billjoy.repository;

import com.billjoy.model.Payment;
import com.billjoy.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.user
            JOIN FETCH p.bill
            WHERE p.user.id = :userId
            ORDER BY p.paymentDate DESC
            """)
    List<Payment> findByUserIdWithDetailsOrderByPaymentDateDesc(@Param("userId") String userId);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.user
            JOIN FETCH p.bill
            WHERE p.bill.id = :billId AND p.paymentStatus = :status
            """)
    Optional<Payment> findByBillIdAndPaymentStatus(@Param("billId") String billId,
            @Param("status") PaymentStatus status);

    List<Payment> findByPaymentStatusOrderByPaymentDateAsc(PaymentStatus status);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.user
            JOIN FETCH p.bill
            ORDER BY p.paymentDate DESC
            """)
    List<Payment> findAllWithDetailsOrderByPaymentDateDesc();
}

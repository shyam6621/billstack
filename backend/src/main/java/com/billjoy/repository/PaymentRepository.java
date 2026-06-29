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

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status")
    java.math.BigDecimal sumAmountByPaymentStatus(@Param("status") PaymentStatus status);

    @Query("SELECT p.paymentMethod, COUNT(p) FROM Payment p WHERE p.paymentStatus = :status GROUP BY p.paymentMethod")
    List<Object[]> countPaymentsByMethod(@Param("status") PaymentStatus status);

    @Query("SELECT p.paymentDate, p.amount FROM Payment p WHERE p.paymentStatus = :status")
    List<Object[]> findSuccessPaymentDatesAndAmounts(@Param("status") PaymentStatus status);

    @Query(value = "SELECT p FROM Payment p JOIN FETCH p.user JOIN FETCH p.bill ORDER BY p.paymentDate DESC",
           countQuery = "SELECT count(p) FROM Payment p")
    org.springframework.data.domain.Page<Payment> findAllWithDetails(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.user.id = :userId AND p.paymentStatus = :status AND p.paymentDate >= :since")
    long countPaymentsByUserAndStatusSince(@Param("userId") String userId, @Param("status") PaymentStatus status, @Param("since") java.time.LocalDateTime since);
}

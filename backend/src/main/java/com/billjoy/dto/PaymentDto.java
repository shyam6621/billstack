package com.billjoy.dto;

import com.billjoy.model.Payment;
import com.billjoy.model.PaymentMethod;
import com.billjoy.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDto {
    private String id;
    private String transaction_id;
    private String user_id;
    private String bill_id;
    // adding bills mapping to handle relation lookup in frontend if needed
    private BillSummaryDto bills;
    private BigDecimal amount;
    private PaymentMethod payment_method;
    private PaymentStatus payment_status;
    private LocalDateTime payment_date;

    public static PaymentDto fromEntity(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .transaction_id(payment.getTransactionId())
                .user_id(payment.getUser().getId())
                .bill_id(payment.getBill().getId())
                .bills(new BillSummaryDto(payment.getBill().getBillType().name()))
                .amount(payment.getAmount())
                .payment_method(payment.getPaymentMethod())
                .payment_status(payment.getPaymentStatus())
                .payment_date(payment.getPaymentDate())
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BillSummaryDto {
        private String bill_type;
    }
}

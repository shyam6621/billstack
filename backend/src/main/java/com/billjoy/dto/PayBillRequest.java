package com.billjoy.dto;

import com.billjoy.model.PaymentMethod;
import lombok.Data;

@Data
public class PayBillRequest {
    private String billId;
    private PaymentMethod paymentMethod;
    private String idempotencyKey;
}

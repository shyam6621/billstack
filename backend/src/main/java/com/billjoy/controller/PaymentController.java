package com.billjoy.controller;

import com.billjoy.dto.PayBillRequest;
import com.billjoy.dto.PaymentDto;
import com.billjoy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<PaymentDto> processPayment(Authentication authentication,
            @RequestBody PayBillRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(authentication.getName(), request));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentDto>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getMyPayments(authentication.getName()));
    }

    // Usually ADMIN only
    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}

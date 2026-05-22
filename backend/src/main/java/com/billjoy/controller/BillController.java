package com.billjoy.controller;

import com.billjoy.dto.BillDto;
import com.billjoy.model.BillStatus;
import com.billjoy.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping("/my-bills")
    public ResponseEntity<List<BillDto>> getMyBills(Authentication authentication) {
        return ResponseEntity.ok(billService.getMyBills(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> getBillById(@PathVariable String id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    // Usually ADMIN only
    @GetMapping
    public ResponseEntity<List<BillDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @PostMapping
    public ResponseEntity<BillDto> createBill(@RequestBody com.billjoy.dto.CreateBillRequest request) {
        return ResponseEntity.ok(billService.createBill(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BillDto> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        BillStatus status = BillStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(billService.updateBillStatus(id, status));
    }
}

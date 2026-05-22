package com.billjoy.service;

import com.billjoy.dto.BillDto;
import com.billjoy.dto.CreateBillRequest;
import com.billjoy.model.Bill;
import com.billjoy.model.BillStatus;
import com.billjoy.model.User;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;

    public List<BillDto> getMyBills(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return billRepository.findByUserIdOrderByDueDateAsc(user.getId())
                .stream()
                .map(BillDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BillDto> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BillDto::fromEntity)
                .collect(Collectors.toList());
    }

    public BillDto getBillById(String id) {
        return billRepository.findById(id)
                .map(BillDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
    }

    public BillDto createBill(CreateBillRequest request) {
        User user = userRepository.findById(request.getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Bill bill = Bill.builder()
                .user(user)
                .billType(request.getBill_type())
                .description(request.getDescription())
                .amount(request.getAmount())
                .dueDate(request.getDue_date())
                .status(BillStatus.PENDING)
                .build();

        return BillDto.fromEntity(billRepository.save(bill));
    }

    public BillDto updateBillStatus(String id, BillStatus status) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        bill.setStatus(status);
        return BillDto.fromEntity(billRepository.save(bill));
    }
}

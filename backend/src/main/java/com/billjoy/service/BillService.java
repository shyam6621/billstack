package com.billjoy.service;

import com.billjoy.dto.BillDto;
import com.billjoy.dto.CreateBillRequest;
import com.billjoy.exception.BillNotFoundException;
import com.billjoy.model.Bill;
import com.billjoy.model.BillStatus;
import com.billjoy.model.User;
import com.billjoy.repository.BillRepository;
import com.billjoy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BillDto> getMyBills(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return billRepository.findByUserIdWithUserOrderByDueDateAsc(user.getId())
                .stream()
                .map(BillDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BillDto> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BillDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public BillDto getBillById(String id) {
        return billRepository.findByIdWithUser(id)
                .map(BillDto::fromEntity)
                .orElseThrow(() -> new BillNotFoundException(id));
    }

    @Transactional
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

    @Transactional
    public BillDto updateBillStatus(String id, BillStatus status) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new BillNotFoundException(id));
        bill.setStatus(status);
        return BillDto.fromEntity(billRepository.save(bill));
    }
}

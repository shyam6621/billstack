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
        Bill bill = billRepository.findByIdWithUser(id)
                .orElseThrow(() -> new BillNotFoundException(id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentUsername = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !bill.getUser().getEmail().equals(currentUsername)) {
                throw new com.billjoy.exception.UnauthorizedBillAccessException();
            }
        }

        return BillDto.fromEntity(bill);
    }

    @Transactional
    public BillDto createBill(CreateBillRequest request) {
        User user = userRepository.findById(request.getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentUsername = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !user.getEmail().equals(currentUsername)) {
                throw new com.billjoy.exception.UnauthorizedBillAccessException();
            }
        }

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

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String currentUsername = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !bill.getUser().getEmail().equals(currentUsername)) {
                throw new com.billjoy.exception.UnauthorizedBillAccessException();
            }
        }

        bill.setStatus(status);
        return BillDto.fromEntity(billRepository.save(bill));
    }
}

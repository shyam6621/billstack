package com.billjoy.dto;

import com.billjoy.model.Bill;
import com.billjoy.model.BillStatus;
import com.billjoy.model.BillType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BillDto {
    private String id;
    private String user_id;
    private BillType bill_type;
    private String description;
    private BigDecimal amount;
    private LocalDate due_date;
    private BillStatus status;
    private LocalDateTime created_at;

    public static BillDto fromEntity(Bill bill) {
        return BillDto.builder()
                .id(bill.getId())
                .user_id(bill.getUser().getId())
                .bill_type(bill.getBillType())
                .description(bill.getDescription())
                .amount(bill.getAmount())
                .due_date(bill.getDueDate())
                .status(bill.getStatus())
                .created_at(bill.getCreatedAt())
                .build();
    }
}

package com.billjoy.dto;

import com.billjoy.model.BillType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBillRequest {
    private String user_id;
    private BillType bill_type;
    private String description;
    private BigDecimal amount;
    private LocalDate due_date;
}

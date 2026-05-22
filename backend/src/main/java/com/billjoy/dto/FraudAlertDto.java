package com.billjoy.dto;

import com.billjoy.model.FraudAlert;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FraudAlertDto {
    private String id;
    private String user_id;
    private UserSummaryDto user;
    private String alert_type;
    private String severity;
    private String description;
    private boolean resolved;
    private LocalDateTime resolved_at;
    private LocalDateTime created_at;

    public static FraudAlertDto fromEntity(FraudAlert alert) {
        return FraudAlertDto.builder()
                .id(alert.getId())
                .user_id(alert.getUser() != null ? alert.getUser().getId() : null)
                .user(alert.getUser() != null ? new UserSummaryDto(alert.getUser().getEmail()) : null)
                .alert_type(alert.getAlertType())
                .severity(alert.getSeverity())
                .description(alert.getDescription())
                .resolved(alert.isResolved())
                .resolved_at(alert.getResolvedAt())
                .created_at(alert.getCreatedAt())
                .build();
    }

    @Data
    public static class UserSummaryDto {
        private final String email;
    }
}

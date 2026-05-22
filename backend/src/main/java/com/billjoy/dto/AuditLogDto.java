package com.billjoy.dto;

import com.billjoy.model.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogDto {
    private String id;
    private String user_id;
    private UserSummaryDto user;
    private String action;
    private String entity_type;
    private String entity_id;
    private String details;
    private String ip_address;
    private LocalDateTime created_at;

    public static AuditLogDto fromEntity(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .user_id(log.getUser() != null ? log.getUser().getId() : null)
                .user(log.getUser() != null ? new UserSummaryDto(log.getUser().getEmail()) : null)
                .action(log.getAction())
                .entity_type(log.getEntityType())
                .entity_id(log.getEntityId())
                .details(log.getDetails())
                .ip_address(log.getIpAddress())
                .created_at(log.getCreatedAt())
                .build();
    }

    @Data
    public static class UserSummaryDto {
        private final String email;
    }
}

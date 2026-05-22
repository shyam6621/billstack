package com.billjoy.dto;

import com.billjoy.model.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private String id;
    private String user_id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String entity_type;
    private String entity_id;
    private LocalDateTime created_at;

    public static NotificationDto fromEntity(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .user_id(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .entity_type(notification.getEntityType())
                .entity_id(notification.getEntityId())
                .created_at(notification.getCreatedAt())
                .build();
    }
}

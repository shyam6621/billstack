package com.billjoy.service;

import com.billjoy.dto.AuditLogDto;
import com.billjoy.model.User;
import com.billjoy.repository.AuditLogRepository;
import com.billjoy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private static final int MAX_ACTIVITY_LOGS = 100;

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AuditLogDto> getMyActivity(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return auditLogRepository.findByUserIdWithUserOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(MAX_ACTIVITY_LOGS)
                .map(AuditLogDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllActivityLogs() {
        return auditLogRepository.findAllWithUserOrderByCreatedAtDesc()
                .stream()
                .limit(50)
                .map(AuditLogDto::fromEntity)
                .toList();
    }
}

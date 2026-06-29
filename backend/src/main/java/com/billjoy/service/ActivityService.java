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

        return auditLogRepository.findByUserIdWithUserOrderByCreatedAtDesc(user.getId(), org.springframework.data.domain.PageRequest.of(0, MAX_ACTIVITY_LOGS))
                .stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllActivityLogs() {
        return auditLogRepository.findAllWithUserOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, 50))
                .stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }
}

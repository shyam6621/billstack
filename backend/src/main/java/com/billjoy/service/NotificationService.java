package com.billjoy.service;

import com.billjoy.dto.NotificationDto;
import com.billjoy.model.Notification;
import com.billjoy.model.User;
import com.billjoy.repository.NotificationRepository;
import com.billjoy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_NOTIFICATIONS = 20;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findByUserIdWithUserOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(MAX_NOTIFICATIONS)
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Transactional
    public void markAsRead(String email, List<String> notificationIds) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);

        notifications.forEach(notif -> {
            if (notif.getUser().getId().equals(user.getId())) {
                notif.setRead(true);
            }
        });
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseWithUser(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}

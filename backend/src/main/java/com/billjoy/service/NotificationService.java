package com.billjoy.service;

import com.billjoy.dto.NotificationDto;
import com.billjoy.model.Notification;
import com.billjoy.model.User;
import com.billjoy.repository.NotificationRepository;
import com.billjoy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationDto> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

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

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}

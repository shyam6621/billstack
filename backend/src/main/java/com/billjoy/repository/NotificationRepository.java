package com.billjoy.repository;

import com.billjoy.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndReadFalse(String userId);
}

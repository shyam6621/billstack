package com.billjoy.repository;

import com.billjoy.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    @Query("""
            SELECT n FROM Notification n
            JOIN FETCH n.user
            WHERE n.user.id = :userId
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findByUserIdWithUserOrderByCreatedAtDesc(@Param("userId") String userId, org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            JOIN FETCH n.user
            WHERE n.user.id = :userId AND n.read = false
            """)
    List<Notification> findByUserIdAndReadFalseWithUser(@Param("userId") String userId);
}

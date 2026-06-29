package com.billjoy.repository;

import com.billjoy.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    @Query("""
            SELECT a FROM AuditLog a
            LEFT JOIN FETCH a.user
            ORDER BY a.createdAt DESC
            """)
    List<AuditLog> findAllWithUserOrderByCreatedAtDesc();

    @Query("""
            SELECT a FROM AuditLog a
            LEFT JOIN FETCH a.user
            WHERE a.user.id = :userId
            ORDER BY a.createdAt DESC
            """)
    List<AuditLog> findByUserIdWithUserOrderByCreatedAtDesc(@Param("userId") String userId);
}

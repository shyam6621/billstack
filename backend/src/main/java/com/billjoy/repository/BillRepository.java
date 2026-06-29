package com.billjoy.repository;

import com.billjoy.model.Bill;
import com.billjoy.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {

    @Query("""
            SELECT b FROM Bill b
            JOIN FETCH b.user
            WHERE b.user.id = :userId
            ORDER BY b.dueDate ASC
            """)
    List<Bill> findByUserIdWithUserOrderByDueDateAsc(@Param("userId") String userId);

    @Query("""
            SELECT b FROM Bill b
            JOIN FETCH b.user
            WHERE b.id = :id
            """)
    Optional<Bill> findByIdWithUser(@Param("id") String id);

    List<Bill> findByStatus(BillStatus status);

    List<Bill> findAllByOrderByCreatedAtDesc();
}

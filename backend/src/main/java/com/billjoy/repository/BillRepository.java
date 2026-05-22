package com.billjoy.repository;

import com.billjoy.model.Bill;
import com.billjoy.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    List<Bill> findByUserIdOrderByDueDateAsc(String userId);

    List<Bill> findByStatus(BillStatus status);

    List<Bill> findAllByOrderByCreatedAtDesc();
}

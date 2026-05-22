package com.billjoy.repository;

import com.billjoy.model.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {
    Page<FraudAlert> findByResolvedFalseOrderByCreatedAtDesc(Pageable pageable);
}

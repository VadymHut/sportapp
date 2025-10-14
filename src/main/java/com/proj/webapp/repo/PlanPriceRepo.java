package com.proj.webapp.repo;

import com.proj.webapp.model.PlanPrice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanPriceRepo extends JpaRepository<PlanPrice, Long>
{
}

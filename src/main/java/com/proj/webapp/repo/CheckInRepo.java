package com.proj.webapp.repo;

import com.proj.webapp.model.CheckIn;
import com.proj.webapp.model.Membership;
import com.proj.webapp.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface CheckInRepo extends JpaRepository<CheckIn, Long>
{
    boolean existsByStaff(Staff staff);
    List<CheckIn> findByMembership_MId(Long mId);
    List<CheckIn> findByMembership_Client_PeId(Long clientId);
    List<CheckIn> findByStaff_PeId(Long staffId);
    long countByMembershipAndVisitedAtBetween(Membership membership, Instant from, Instant to);
}

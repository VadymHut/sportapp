package com.proj.webapp.repo;

import com.proj.webapp.model.Membership;
import com.proj.webapp.model.MembershipPlan;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface MembershipRepo extends JpaRepository<Membership, Long>
{
    boolean existsByMembershipPlan(@NotNull MembershipPlan membershipPlan);
    List<Membership> findByTrainer_id(@NotNull Long trainerId);
    List<Membership> findByMembershipPlan_id(@NotNull Long membershipPlanId);
    @Query("""
        select m from Membership m
        left join m.client c
        left join m.trainer t
        left join m.membershipPlan p
        where
            (str(m.id) like concat('%', :term, '%'))
         or (c is not null and (
                lower(c.name) like concat('%', :term, '%')
             or lower(c.surname) like concat('%', :term, '%')
             or lower(c.personalCode) like concat('%', :term, '%')
         ))
         or (t is not null and (
                lower(t.name) like concat('%', :term, '%')
             or lower(t.surname) like concat('%', :term, '%')
         ))
         or (p is not null and (
                lower(str(p.activityType))  like concat('%', :term, '%')
             or lower(str(p.groupType))     like concat('%', :term, '%')
             or lower(str(p.frequencyType)) like concat('%', :term, '%')
         ))
    """)
    Page<Membership> searchByTerm(@Param("term") String term, Pageable pageable);

    @EntityGraph(attributePaths = { "membershipPlan", "trainer" })
    List<Membership> findByClient_id(Long clientId);

    @EntityGraph(attributePaths = { "membershipPlan", "trainer", "checkIns", "checkIns.staff" })
    List<Membership> findWithCheckInsByClientId(Long clientId);

    int countByClientId(Long clientId);

    @Query("""
           select count(m) from Membership m
           where m.client.id = :clientId
             and m.startingDate <= :today
             and (m.endingDate is null or m.endingDate >= :today)
           """)
    int countActiveByClientId(Long clientId, LocalDate today);

    @Query("""
           select m.id from Membership m
           where m.client.id = :clientId
             and m.startingDate <= :today
             and (m.endingDate is null or m.endingDate >= :today)
           order by coalesce(m.endingDate, :today) asc
           """)
    List<Long> findActiveMembershipIds(Long clientId, LocalDate today);

    @Query("""
           select min(m.endingDate) from Membership m
           where m.client.id = :clientId
             and m.endingDate is not null
             and m.endingDate >= :today
           """)
    LocalDate nearestEndingDate(Long clientId, LocalDate today);

    @Query("""
        select distinct m from Membership m
        left join fetch m.checkIns
        where m.trainer.id = :trainerId
    """)
    List<Membership> findWithCheckInsByTrainerId(@Param("trainerId") Long trainerId);

    @Query("""
        select m from Membership m
        where m.trainer.id = :trainerId
          and m.startingDate <= :today
          and (m.endingDate is null or m.endingDate >= :today)
        order by m.endingDate asc nulls last
    """)
    List<Membership> findActiveByTrainerId(@Param("trainerId") Long trainerId,
                                           @Param("today") LocalDate today);

    @Query("""
        select distinct m from Membership m
        left join fetch m.checkIns
        where m.trainer.id = :trainerId
          and m.startingDate <= :today
          and (m.endingDate is null or m.endingDate >= :today)
        order by m.endingDate asc nulls last
    """)
    List<Membership> findActiveWithCheckInsByTrainerId(@Param("trainerId") Long trainerId,
                                                       @Param("today") LocalDate today);

    @Query("""
        select m from Membership m
        where m.trainer.id = :trainerId
          and m.endingDate is not null
          and m.endingDate < :today
        order by m.endingDate desc
    """)
    List<Membership> findPastByTrainerId(@Param("trainerId") Long trainerId,
                                         @Param("today") LocalDate today);

    @Query("""
        select distinct m from Membership m
        left join fetch m.checkIns
        where m.trainer.id = :trainerId
          and m.endingDate is not null
          and m.endingDate < :today
        order by m.endingDate desc
    """)
    List<Membership> findPastWithCheckInsByTrainerId(@Param("trainerId") Long trainerId,
                                                     @Param("today") LocalDate today);

    @Query("select count(m) from Membership m where m.trainer.id = :trainerId")
    int countByTrainerId(@Param("trainerId") Long trainerId);

    @Query("""
        select count(m) from Membership m
        where m.trainer.id = :trainerId
          and m.startingDate <= :today
          and (m.endingDate is null or m.endingDate >= :today)
    """)
    int countActiveByTrainerId(@Param("trainerId") Long trainerId,
                               @Param("today") LocalDate today);

    @Query("""
        select min(m.endingDate) from Membership m
        where m.trainer.id = :trainerId
          and m.startingDate <= :today
          and (m.endingDate is null or m.endingDate >= :today)
          and m.endingDate is not null
    """)
    LocalDate nearestEndingDateForTrainer(@Param("trainerId") Long trainerId,
                                          @Param("today") LocalDate today);

    @Query("""
        select distinct m.client.id from Membership m
        where m.trainer.id = :trainerId
    """)
    List<Long> findDistinctClientIdsByTrainerId(@Param("trainerId") Long trainerId);

    @Query("""
        select distinct m.client.id from Membership m
        where m.trainer.id = :trainerId
          and m.startingDate <= :today
          and (m.endingDate is null or m.endingDate >= :today)
    """)
    List<Long> findActiveClientIdsByTrainerId(@Param("trainerId") Long trainerId,
                                              @Param("today") LocalDate today);

    @Query("""
      select count(m) from Membership m
      where m.startingDate between :from and :to
    """)
    long countStartingBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

}

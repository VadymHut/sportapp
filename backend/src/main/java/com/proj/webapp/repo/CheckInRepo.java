package com.proj.webapp.repo;

import com.proj.webapp.model.CheckIn;
import com.proj.webapp.model.Membership;
import com.proj.webapp.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CheckInRepo extends JpaRepository<CheckIn, Long>
{
    boolean existsByStaff(Staff staff);

    List<CheckIn> findByMembership_id(Long id);
    List<CheckIn> findByMembership_Client_id(Long id);
    List<CheckIn> findByStaff_id(Long id);

    long countByMembershipAndVisitedAtBetween(Membership membership, Instant from, Instant to);

    @Query("""
        select ci from CheckIn ci
        left join ci.membership m
        left join m.client c
        left join ci.staff s
        where
            (
                :idTerm is not null
                and (ci.id = :idTerm or m.id = :idTerm)
            )
         or (
                c is not null and (
                       lower(c.name)    like concat('%', :term, '%')
                    or lower(c.surname) like concat('%', :term, '%')
                    or c.personalCode   like concat('%', :term, '%')
                )
            )
         or (
                s is not null and (
                       lower(s.name)    like concat('%', :term, '%')
                    or lower(s.surname) like concat('%', :term, '%')
                )
            )
    """)
    Page<CheckIn> searchByTerm(
            @Param("term") String term,
            @Param("idTerm") Long idTerm,
            Pageable pageable
    );

    List<CheckIn> findByMembershipIdOrderByVisitedAtDesc(Long membershipId);

    @Query("""
           select count(ci) from CheckIn ci
           where ci.membership.client.id = :clientId
           """)
    long countByClientId(@Param("clientId") Long clientId);

    @Query("""
           select max(ci.visitedAt) from CheckIn ci
           where ci.membership.client.id = :clientId
           """)
    Instant lastCheckInAt(@Param("clientId") Long clientId);

    @Query("""
           select count(ci) from CheckIn ci
           where ci.membership.trainer.id = :trainerId
           """)
    long countByTrainerId(@Param("trainerId") Long trainerId);

    @Query("""
           select max(ci.visitedAt) from CheckIn ci
           where ci.membership.trainer.id = :trainerId
           """)
    Instant lastCheckInAtByTrainer(@Param("trainerId") Long trainerId);

    @Query("""
      select count(ci) from CheckIn ci
      where ci.visitedAt between :from and :to
    """)
    long countBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
      with latest as (
        select distinct on (ci.membership_id)
               ci.membership_id, ci.visited_at
        from check_in ci
        where ci.visited_at between :from and :to
        order by ci.membership_id, ci.visited_at desc
      )
      select coalesce(mp.activity_type, 'UNKNOWN') as activity, count(*) as c
      from latest l
      join membership m on m.id = l.membership_id
      left join membership_plan mp on mp.id = m.plan_id
      group by 1
      order by 2 desc
    """, nativeQuery = true)
    List<Object[]> presentByActivity(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
      select to_char(date_trunc('hour', ci.visited_at AT TIME ZONE :tz), 'HH24:00') as h,
             count(*) as c
      from check_in ci
      where ci.visited_at between :from and :to
      group by 1
      order by 1
    """, nativeQuery = true)
    List<Object[]> hourlyCounts(@Param("from") Instant from, @Param("to") Instant to, @Param("tz") String tz);

    @Query(value = """
      select to_char((ci.visited_at AT TIME ZONE :tz)::date, 'YYYY-MM-DD') as d,
             count(*) as c
      from check_in ci
      where ci.visited_at between :from and :to
      group by 1
      order by 1
    """, nativeQuery = true)
    List<Object[]> dailyCounts(@Param("from") Instant from, @Param("to") Instant to, @Param("tz") String tz);

    @Query(value = """
      select coalesce(mp.activity_type, 'UNKNOWN') as activity, count(*) as c
      from check_in ci
      join membership m on m.id = ci.membership_id
      left join membership_plan mp on mp.id = m.plan_id
      where ci.visited_at between :from and :to
      group by 1
      order by 2 desc
    """, nativeQuery = true)
    List<Object[]> byActivityBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
      select t.id, coalesce(t.name,''), coalesce(t.surname,''), count(*) as c
      from check_in ci
      join membership m on m.id = ci.membership_id
      join trainer t on t.id = m.trainer_id
      where ci.visited_at between :from and :to
      group by t.id, t.name, t.surname
      order by c desc
      limit 5
    """, nativeQuery = true)
    List<Object[]> topTrainersBetween(@Param("from") Instant from, @Param("to") Instant to);
}

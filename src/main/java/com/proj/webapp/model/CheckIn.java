package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "checkIn")
@Getter @Setter
@NoArgsConstructor
@ToString(exclude = {"membership", "staff"})
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long chId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "m_id", nullable = false)
    @NotNull
    private Membership membership;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "s_id", nullable = false)
    @NotNull
    private Staff staff;

    @NotNull
    @Column(name = "visited_at", nullable = false)
    private Instant visitedAt;

    @PrePersist
    private void prePersist()
    {
        if (visitedAt == null) visitedAt = Instant.now();
    }
}

package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "s_id", nullable = false)
    private Staff staff;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // client can't set it
    @Column(name = "visited_at", nullable = false)
    private Instant visitedAt;

    @PrePersist
    private void prePersist()
    {
        if (visitedAt == null) visitedAt = Instant.now();
    }

    @JsonProperty("id")
    public Long getId() { return chId; }
}

package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membership_id", nullable = false)
    @NotNull
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Membership.class)
    @JsonIdentityReference(alwaysAsId = true)
    private Membership membership;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Staff.class)
    @JsonIdentityReference(alwaysAsId = true)
    private Staff staff;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "visited_at", nullable = false)
    private Instant visitedAt;

    @PrePersist
    private void prePersist()
    {
        if (visitedAt == null) visitedAt = Instant.now();
    }

    @JsonProperty("id")
    void setJsonId(Long id) { this.id = id; }

    @JsonProperty("id")
    public Long getId() { return id; }
}

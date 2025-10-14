package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "membership")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"client", "trainer", "membershipPlan", "checkIns"})
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long mId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "c_id", nullable = false)
    @NotNull
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "t_id")
    private Trainer trainer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pl_id", nullable = false)
    @NotNull
    private MembershipPlan membershipPlan;

    @NotNull
    @Column(name = "starting_date", nullable = false)
    private LocalDate startingDate;

    @Column(name = "ending_date", nullable = false)
    @Setter(AccessLevel.NONE)
    private LocalDate endingDate;

    @PrePersist
    private void prePersist() {
        if (startingDate == null) startingDate = LocalDate.now();
        endingDate = startingDate.plusMonths(1);
    }

    @PreUpdate
    private void preUpdate() {
        endingDate = startingDate.plusMonths(1);
    }

    @OneToMany(mappedBy = "membership", fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE },
            orphanRemoval = true)
    @OrderBy("visitedAt DESC")
    private List<CheckIn> checkIns = new ArrayList<>();

}

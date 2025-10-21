package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "membership_plan",
        uniqueConstraints = @UniqueConstraint(name = "uk_membership_plan_combo", columnNames = {"activity_type", "group_type", "frequency_type"})
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = { "prices", "memberships" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long plId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 40)
    @EqualsAndHashCode.Include
    private ActivityType activityType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "group_type", nullable = false, length = 40)
    @EqualsAndHashCode.Include
    private GroupType groupType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency_type", nullable = false, length = 40)
    @EqualsAndHashCode.Include
    private FrequencyType frequencyType;


    @OneToMany(
            mappedBy = "membershipPlan",
            fetch = FetchType.LAZY,
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            orphanRemoval = false
    )
    @OrderBy("validFrom DESC")
    @JsonIgnore
    private List<PlanPrice> prices = new ArrayList<>();

    @OneToMany(
            mappedBy = "membershipPlan",
            fetch = FetchType.LAZY,
            cascade = { CascadeType.PERSIST, CascadeType.MERGE }
    )
    @OrderBy("startingDate DESC")
    @JsonIgnore
    private List<Membership> memberships = new ArrayList<>();


    @JsonProperty("id")
    public Long getId() { return plId; }
}

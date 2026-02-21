package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "plan_price")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "membershipPlan")
public class PlanPrice
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;

    @NotNull
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    private MembershipPlan membershipPlan;

    @PositiveOrZero
    @Column(nullable = false)
    private double price;

    @NotNull
    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;


    @AssertTrue(message = "validTo must be on or after validFrom")
    private boolean isDateRangeValid()
    {
        return validTo == null || !validTo.isBefore(validFrom);
    }


    @JsonProperty("id")
    void setJsonId(Long id) { this.id = id; }

    @JsonProperty("id")
    public Long getId() { return id; }
}

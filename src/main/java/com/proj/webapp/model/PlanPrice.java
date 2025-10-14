package com.proj.webapp.model;

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
public class PlanPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long prId;

    @NotNull
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "pl_id", nullable = false)
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

}

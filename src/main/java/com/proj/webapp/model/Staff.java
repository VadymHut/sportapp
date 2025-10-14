package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "staff")
@Getter @Setter
@NoArgsConstructor
@ToString(callSuper = true)
public class Staff extends Person {

    @NotBlank
    @Size(min = 2, max = 30)
    @Pattern(
            regexp = "^[\\p{L}0-9&/ .,'-]+$",
            message = "Job title may contain letters, numbers, spaces, and -/&,.'"
    )
    @Column(nullable = false, length = 30)
    private String jobTitle;

    @OneToOne(mappedBy = "staff", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private AppUser account;
}

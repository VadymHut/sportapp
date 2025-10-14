package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

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

    @OneToOne(mappedBy = "staff", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private AppUser account;

    @OneToMany(mappedBy = "staff", fetch = FetchType.LAZY)
    @ToString.Exclude
    @OrderBy("visitedAt DESC")
    private List<CheckIn> checkIns = new ArrayList<>();
}

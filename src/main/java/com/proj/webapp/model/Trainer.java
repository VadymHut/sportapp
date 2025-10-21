package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trainer")
@Getter
@Setter
@ToString(callSuper = true, exclude = "memberships")
@NoArgsConstructor
public class Trainer extends Person
{
    @NotNull
    @Column(nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private ActivityType activity;

    @OneToMany(
            mappedBy = "trainer",
            fetch = FetchType.LAZY,
            cascade = { CascadeType.PERSIST, CascadeType.MERGE }
    )
    @OrderBy("startingDate DESC")
    @JsonIgnore
    private List<Membership> memberships = new ArrayList<>();
}

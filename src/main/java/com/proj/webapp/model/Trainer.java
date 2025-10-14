package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "trainer")
@Getter
@Setter
@ToString(callSuper = true)
@NoArgsConstructor
public class Trainer extends Person
{
    @NotNull
    @Column(nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private ActivityType activity;
}

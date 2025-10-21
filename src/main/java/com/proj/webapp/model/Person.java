package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public abstract class Person
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long peId;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "Name may contain letters, spaces, hyphens and apostrophes"
    )
    private String name;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "Surname may contain letters, spaces, hyphens and apostrophes"
    )
    private String surname;

    @NotBlank
    @Column(nullable = false, length = 12, unique = true)
    @Pattern(regexp = "^\\d{6}-\\d{5}$", message = "Personal code must follow the format 123456-12345")
    @EqualsAndHashCode.Include
    private String personalCode;

    @Email
    @Size(max = 254)
    @Column(length = 254)
    private String email;

    @NotNull
    @PastOrPresent
    @Column(nullable = false)
    private LocalDate joinedOn;

    protected boolean canEqual(final Object other)
    {
        return other != null && this.getClass() == other.getClass();
    }

    private void normalize()
    {
        if (name != null) name = name.trim();
        if (surname != null) surname = surname.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (personalCode != null) personalCode = personalCode.trim();
    }

    @PrePersist
    private void prePersist()
    {
        if (joinedOn == null) joinedOn = LocalDate.now();
        normalize();
    }

    @PreUpdate
    private void preUpdate()
    {
        normalize();
    }

    @JsonProperty("id")
    public Long getId() { return peId; }
}

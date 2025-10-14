package com.proj.webapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "password")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AppUser
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long uid;

    @OneToOne(optional = false)
    @JoinColumn(name = "sid", nullable = false, unique = true)
    private Staff staff;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    @NotBlank
    @Size(max = 50)
    @Column(name = "login", nullable = false, length = 50, unique = true)
    @EqualsAndHashCode.Include
    private String login;


    @NotBlank
    @Size(min = 60, max = 100)
    @Column(name = "password_hash", nullable = false, length = 100)
    private String password;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @PrePersist
    @PreUpdate
    private void normalize()
    {
        if (login != null) login = login.trim().toLowerCase();
    }

    public void markLoginNow()
    {
        this.lastLoginAt = Instant.now();
    }
}

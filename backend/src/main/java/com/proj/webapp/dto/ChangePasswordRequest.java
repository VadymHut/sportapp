
package com.proj.webapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank
        @JsonAlias({"currentPassword", "old"})
        String oldPassword,

        @NotBlank
        @Size(min = 8, message = "New password must be at least 8 characters")
        @JsonAlias({"new", "password"})
        String newPassword
) {}

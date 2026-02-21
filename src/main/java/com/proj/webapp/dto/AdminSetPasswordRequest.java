package com.proj.webapp.dto;

import jakarta.validation.constraints.NotBlank;

//not used eventually
public record AdminSetPasswordRequest(@NotBlank String newPassword) {}
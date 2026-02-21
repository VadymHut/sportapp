package com.proj.webapp.controller;

import com.proj.webapp.dto.ChangePasswordRequest;
import com.proj.webapp.model.AppUser;
import com.proj.webapp.repo.AppUserRepo;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder encoder;

    public AccountController(AppUserRepo appUserRepo, PasswordEncoder encoder) {
        this.appUserRepo = appUserRepo;
        this.encoder = encoder;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        AppUser u = appUserRepo.findByLogin(principal.getName())
                .orElse(null);
        if (u == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        if (!encoder.matches(req.oldPassword(), u.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        if (req.newPassword().equals(req.oldPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be different from the current password"));
        }

        u.setPassword(encoder.encode(req.newPassword()));
        appUserRepo.save(u);

        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }
}

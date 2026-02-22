package com.proj.webapp.service;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.repo.AppUserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AppUserRepo appUserRepo, PasswordEncoder passwordEncoder) {
        this.appUserRepo = appUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void changeOwnPassword(Long userId, String currentPassword, String newPassword) {
        AppUser user = appUserRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        validatePolicy(newPassword);

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        appUserRepo.save(user);
    }

    @Transactional
    public void adminSetPassword(Long targetUserId, String newPassword) {
        AppUser user = appUserRepo.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUserId));
        validatePolicy(newPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
        appUserRepo.save(user);
    }

    private void validatePolicy(String p) {
        if (p == null || p.trim().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
    }
}

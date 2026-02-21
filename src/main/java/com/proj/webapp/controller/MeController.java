package com.proj.webapp.controller;

import com.proj.webapp.repo.AppUserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MeController {
    private final AppUserRepo appUserRepo;

    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        if (auth == null) return Map.of("authenticated", false);

        var roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();

        var user = appUserRepo.findByLogin(auth.getName()).orElse(null);

        return Map.of(
                "authenticated", true,
                "username", auth.getName(),
                "userId", user != null ? user.getId() : null,
                "roles", roles
        );
    }
}
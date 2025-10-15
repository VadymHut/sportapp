package com.proj.webapp.service;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.repo.AppUserRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class AppUserService
{

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUser createAppUser(@Valid @NotNull AppUser appUser)
    {
        if (appUser.getUid() != null)
        {
            throw new IllegalArgumentException("uid should not be set");
        }
        appUser.setLogin(appUser.getLogin().trim().toLowerCase());

        if (appUserRepo.existsByStaff(appUser.getStaff())) {
            throw new IllegalArgumentException("this staff already has an account");
        }
        if (appUserRepo.existsByLogin(appUser.getLogin())) {
            throw new IllegalArgumentException("login already in use");
        }
        appUser.setPassword(passwordEncoder.encode(appUser.getPassword()));

        try
        {
            return appUserRepo.save(appUser);
        }
        catch (DataIntegrityViolationException e)
        {
            throw new IllegalArgumentException("duplicate login or staff reference");
        }
    }

    @Transactional(readOnly = true)
    public AppUser getById(@NotNull Long id)
    {
        return appUserRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("AppUser with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public AppUser getByLogin(@NotBlank String login)
    {
        String normalized = login.trim().toLowerCase();
        return appUserRepo.findByLogin(normalized).orElseThrow(() -> new IllegalArgumentException("AppUser with login " + login + " not found"));
    }

    @Transactional(readOnly = true)
    public List<AppUser> listAll()
    {
        return appUserRepo.findAll();
    }

    public AppUser update(@NotNull Long id, @Valid @NotNull AppUser edited)
    {
        var existing = appUserRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("AppUser with id " + id + " not found"));

        if (!existing.getLogin().equalsIgnoreCase(edited.getLogin()))
        {
            throw new IllegalArgumentException("login cannot be changed");
        }
        if (!existing.getStaff().getPeId().equals(edited.getStaff().getPeId()))
        {
            throw new IllegalArgumentException("staff cannot be changed");
        }

        existing.setRole(edited.getRole());

        if (edited.getPassword() != null && !edited.getPassword().isBlank())
        {
            existing.setPassword(passwordEncoder.encode(edited.getPassword()));
        }
        return existing;
    }

    public void delete(@NotNull Long id)
    {
        if (!appUserRepo.existsById(id))
        {
            throw new IllegalArgumentException("AppUser with id " + id + " not found");
        }
        appUserRepo.deleteById(id);
    }

    public void markLogin(@NotBlank String login)
    {
        var normalized = login.trim().toLowerCase();
        appUserRepo.findByLogin(normalized).ifPresent(u -> u.markLoginNow());
    }
}

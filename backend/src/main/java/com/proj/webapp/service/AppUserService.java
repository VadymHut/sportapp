package com.proj.webapp.service;

import com.proj.webapp.dto.StaffBriefInfo;
import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Staff;
import com.proj.webapp.repo.AppUserRepo;
import com.proj.webapp.repo.StaffRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class AppUserService
{

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;
    private final StaffRepo staffRepo;

    @Transactional
    public AppUser createAppUser(@Valid @NotNull AppUser appUser)
    {
        if (appUser.getId() != null) {
            throw new IllegalArgumentException("uid should not be set");
        }
        if (appUser.getStaff() == null || appUser.getStaff().getId() == null) {
            throw new IllegalArgumentException("staff id is required");
        }
        if (appUser.getLogin() == null || appUser.getLogin().isBlank()) {
            throw new IllegalArgumentException("login is required");
        }

        appUser.setLogin(appUser.getLogin().trim().toLowerCase());

        var staff = staffRepo.findById(appUser.getStaff().getId())
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + appUser.getStaff().getId()));
        appUser.setStaff(staff);

        if (appUserRepo.existsByStaff(staff)) {
            throw new IllegalArgumentException("this staff already has an account");
        }
        if (appUserRepo.existsByLogin(appUser.getLogin())) {
            throw new IllegalArgumentException("login already in use");
        }

        appUser.setPassword(passwordEncoder.encode(appUser.getPassword()));
        try {
            return appUserRepo.save(appUser);
        } catch (DataIntegrityViolationException e) {
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

    @Transactional(readOnly = true)
    public Page<AppUser> listPaged(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return appUserRepo.findAll(pageable);
        }
        return appUserRepo.searchByTerm(q.toLowerCase(), pageable);
    }

    @Transactional
    public AppUser update(@NotNull Long id, @Valid @NotNull AppUser edited) {
        var existing = appUserRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("AppUser with id " + id + " not found"));

        if (!existing.getLogin().equalsIgnoreCase(edited.getLogin())) {
            throw new IllegalArgumentException("login cannot be changed");
        }
        if (edited.getStaff() != null && edited.getStaff().getId() != null
                && !existing.getStaff().getId().equals(edited.getStaff().getId())) {
            throw new IllegalArgumentException("staff cannot be changed");
        }

        existing.setRole(edited.getRole());

        if (edited.getPassword() != null && !edited.getPassword().isBlank()) {
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

    @Transactional
    public void recordLogin(String rawLogin)
    {
        if (rawLogin == null) return;
        String normalized = rawLogin.trim().toLowerCase();
        appUserRepo.findByLogin(normalized).ifPresent(u -> {
            u.markLoginNow();
            appUserRepo.save(u);
        });
    }

    public StaffBriefInfo getBriefInfo(@NotNull Long appUserId) {
        AppUser user = appUserRepo.findById(appUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Staff staff = Optional.ofNullable(user.getStaff())
                .flatMap(s -> staffRepo.findById(s.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found"));

        return new StaffBriefInfo(staff.getId(), staff.getName(), staff.getSurname());
    }
}

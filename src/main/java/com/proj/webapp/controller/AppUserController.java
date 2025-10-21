package com.proj.webapp.controller;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Client;
import com.proj.webapp.service.AppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app-users")
@RequiredArgsConstructor
public class AppUserController {

    private final AppUserService appUserService;

    @PostMapping
    public ResponseEntity<AppUser> create(@RequestBody @Valid AppUser body)
    {
        var saved = appUserService.createAppUser(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public AppUser get(@PathVariable Long id) {
        return appUserService.getById(id);
    }

    @GetMapping("/by-login")
    public AppUser getByLogin(@RequestParam String login) {
        return appUserService.getByLogin(login);
    }

    @GetMapping
    public ResponseEntity<List<AppUser>> list() {
        List<AppUser> data = appUserService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public AppUser update(@PathVariable Long id, @RequestBody @Valid AppUser body) {
        return appUserService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        appUserService.delete(id);
    }
}

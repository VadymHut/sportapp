package com.proj.webapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.webapp.dto.StaffBriefInfo;
import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Client;
import com.proj.webapp.service.AppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<List<AppUser>> list(
            @RequestParam(value = "filter", required = false) String filterJson,
            @RequestParam(value = "_start", required = false) Integer start,
            @RequestParam(value = "_end", required = false) Integer end,
            @RequestParam(value = "_sort", required = false) String sortField,
            @RequestParam(value = "_order", required = false) String sortDir
    ) {
        String q = null;
        if (filterJson != null && !filterJson.isBlank()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> map = mapper.readValue(filterJson, Map.class);
                Object qObj = map.get("q");
                if (qObj != null) {
                    q = qObj.toString().trim();
                }
            } catch (Exception ignore) {
            }
        }

        int defaultPageSize = 10;
        int s = (start == null) ? 0 : Math.max(0, start);
        int e = (end == null || end <= s) ? (s + defaultPageSize) : end;
        int size = e - s;
        if (size <= 0) size = defaultPageSize;
        int pageIndex = s / size;

        String sortProperty = (sortField == null || sortField.isBlank()) ? "id" : sortField;
        Sort.Direction direction =
                "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageIndex, size, direction, sortProperty);

        Page<AppUser> page = appUserService.listPaged(q, pageable);

        long total = page.getTotalElements();
        int from = pageIndex * size;
        int to = page.getNumberOfElements() == 0
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (from + page.getNumberOfElements() - 1);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "app-users " + from + "-" + to + "/" + total);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    @GetMapping("/staffinfo/{userId}")
    public ResponseEntity<StaffBriefInfo> getStaffInfo(@PathVariable Long userId)
    {
        try
        {
            StaffBriefInfo staffInfo = appUserService.getBriefInfo(userId);
            return staffInfo != null ? ResponseEntity.ok(staffInfo) : ResponseEntity.notFound().build();
        }
        catch (Exception e)
        {
            return ResponseEntity.internalServerError().build();
        }
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

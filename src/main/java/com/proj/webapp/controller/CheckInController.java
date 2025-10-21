package com.proj.webapp.controller;

import com.proj.webapp.model.CheckIn;
import com.proj.webapp.model.Client;
import com.proj.webapp.service.CheckInService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkinService;

    @PostMapping
    public ResponseEntity<CheckIn> create(@RequestBody @Valid CheckInCreateRequest body)
    {
        var saved = checkinService.createByIds(body.membershipId(), body.staffId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public CheckIn get(@PathVariable Long id)
    {
        return checkinService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<CheckIn>> list() {
        List<CheckIn> data = checkinService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
    @GetMapping("/by-membership/{membershipId}")
    public List<CheckIn> listByMembership(@PathVariable Long membershipId)
    {
        return checkinService.listByMembership(membershipId);
    }

    @GetMapping("/by-client/{clientId}")
    public List<CheckIn> listByClient(@PathVariable Long clientId)
    {
        return checkinService.listByClient(clientId);
    }

    @GetMapping("/by-staff/{staffId}")
    public List<CheckIn> listByStaff(@PathVariable Long staffId)
    {
        return checkinService.listByStaff(staffId);
    }

    @PutMapping("/{id}")
    public CheckIn update(@PathVariable Long id, @RequestBody @Valid CheckIn body)
    {
        return checkinService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        checkinService.delete(id);
    }

    public static record CheckInCreateRequest(@NotNull Long membershipId, @NotNull Long staffId) {}
}

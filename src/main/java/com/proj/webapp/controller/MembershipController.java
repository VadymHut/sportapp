package com.proj.webapp.web;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.Membership;
import com.proj.webapp.service.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @PostMapping
    public ResponseEntity<Membership> create(@RequestBody @Valid Membership body)
    {
        var saved = membershipService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Membership get(@PathVariable Long id)
    {
        return membershipService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Membership>> list() {
        List<Membership> data = membershipService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/by-client/{clientId}")
    public List<Membership> listByClient(@PathVariable Long clientId)
    {
        return membershipService.listByClient(clientId);
    }

    @GetMapping("/by-trainer/{trainerId}")
    public List<Membership> listByTrainer(@PathVariable Long trainerId)
    {
        return membershipService.listByTrainer(trainerId);
    }

    @GetMapping("/by-plan/{planId}")
    public List<Membership> listByPlan(@PathVariable Long planId)
    {
        return membershipService.listByPlan(planId);
    }

    @PutMapping("/{id}")
    public Membership update(@PathVariable Long id, @RequestBody @Valid Membership body)
    {
        return membershipService.update(id, body);
    }

    @PatchMapping("/{id}/trainer")
    public Membership reassignTrainer(@PathVariable Long id, @RequestParam(required = false) Long trainerId)
    {
        return membershipService.reassignTrainer(id, trainerId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        membershipService.delete(id);
    }
}

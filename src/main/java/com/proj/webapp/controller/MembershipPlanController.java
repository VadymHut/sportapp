package com.proj.webapp.controller;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.service.MembershipPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-plans")
@RequiredArgsConstructor
public class MembershipPlanController
{

    private final MembershipPlanService membershipPlanService;

    @PostMapping
    public ResponseEntity<MembershipPlan> create(@RequestBody @Valid MembershipPlan body)
    {
        var saved = membershipPlanService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public MembershipPlan get(@PathVariable Long id)
    {
        return membershipPlanService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<MembershipPlan>> list()
    {
        List<MembershipPlan> data = membershipPlanService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public MembershipPlan update(@PathVariable Long id, @RequestBody @Valid MembershipPlan body)
    {
        return membershipPlanService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        membershipPlanService.delete(id);
    }
}

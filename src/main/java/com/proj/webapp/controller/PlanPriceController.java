package com.proj.webapp.controller;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.PlanPrice;
import com.proj.webapp.service.PlanPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/plan-prices")
@RequiredArgsConstructor
public class PlanPriceController
{

    private final PlanPriceService planPriceService;

    @PostMapping
    public ResponseEntity<PlanPrice> create(@RequestBody @Valid PlanPrice body)
    {
        var saved = planPriceService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public PlanPrice get(@PathVariable Long id)
    {
        return planPriceService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<PlanPrice>> list()
    {
        List<PlanPrice> data = planPriceService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/by-plan/{planId}")
    public List<PlanPrice> listByPlan(@PathVariable Long planId)
    {
        return planPriceService.listByPlan(planId);
    }

    @GetMapping("/active")
    public PlanPrice getActive(@RequestParam Long planId, @RequestParam LocalDate date)
    {
        return planPriceService.findActivePrice(planId, date).orElseThrow(() -> new IllegalArgumentException("Active price not found for the given date"));
    }

    @PutMapping("/{id}")
    public PlanPrice update(@PathVariable Long id, @RequestBody @Valid PlanPrice body)
    {
        return planPriceService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        planPriceService.delete(id);
    }
}

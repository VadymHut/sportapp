package com.proj.webapp.controller;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.Trainer;
import com.proj.webapp.service.TrainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
public class TrainerController
{

    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<Trainer> create(@RequestBody @Valid Trainer body)
    {
        var saved = trainerService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Trainer get(@PathVariable Long id)
    {
        return trainerService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Trainer>> list()
    {
        List<Trainer> data = trainerService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public Trainer update(@PathVariable Long id, @RequestBody @Valid Trainer body)
    {
        return trainerService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        trainerService.delete(id);
    }
}

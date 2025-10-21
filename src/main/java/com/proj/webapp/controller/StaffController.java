package com.proj.webapp.web;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.Staff;
import com.proj.webapp.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController
{

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<Staff> create(@RequestBody @Valid Staff body)
    {
        var saved = staffService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Staff get(@PathVariable Long id)
    {
        return staffService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Staff>> list()
    {
        List<Staff> data = staffService.listAll();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients 0-" + Math.max(0, data.size() - 1) + "/" + data.size());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Long id, @RequestBody @Valid Staff body)
    {
        return staffService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        staffService.delete(id);
    }
}

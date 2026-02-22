package com.proj.webapp.controller;

import com.proj.webapp.service.EnumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/enums")
@RequiredArgsConstructor
public class EnumController {

    private final EnumService enumService;

    @GetMapping
    public ResponseEntity<Map<String, List<String>>> all()
    {
        var body = Map.of(
                "activityTypes", enumService.activityTypes(),
                "groupTypes", enumService.groupTypes(),
                "frequencyTypes", enumService.frequencyTypes()
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping("/activity-types")
    public List<String> activityTypes()
    {
        return enumService.activityTypes();
    }

    @GetMapping("/group-types")
    public List<String> groupTypes()
    {
        return enumService.groupTypes();

    }

    @GetMapping("/frequency-types")
    public List<String> frequencyTypes()
    {
        return enumService.frequencyTypes();
    }
}

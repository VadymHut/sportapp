package com.proj.webapp.controller;

import com.proj.webapp.dto.TrainerInfo;
import com.proj.webapp.service.TrainerInfoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainers")
public class TrainerInfoController {

    private final TrainerInfoService service;

    public TrainerInfoController(TrainerInfoService service) {
        this.service = service;
    }

    @GetMapping("/{id}/info")
    public TrainerInfo get(@PathVariable Long id,
                           @RequestParam(defaultValue = "false") boolean includeCheckIns) {
        return service.get(id, includeCheckIns);
    }
}

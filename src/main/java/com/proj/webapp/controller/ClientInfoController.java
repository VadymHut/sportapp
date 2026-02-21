package com.proj.webapp.controller;

import com.proj.webapp.dto.ClientInfo;
import com.proj.webapp.service.ClientInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientInfoController {

    private final ClientInfoService service;

    @GetMapping("/{id}/info")
    public ResponseEntity<ClientInfo> getClientInfo(
            @PathVariable Long id,
            @RequestParam(name = "includeCheckIns", defaultValue = "true") boolean includeCheckIns
    ) {
        ClientInfo info = service.get(id, includeCheckIns);
        return ResponseEntity.ok(info);
    }
}

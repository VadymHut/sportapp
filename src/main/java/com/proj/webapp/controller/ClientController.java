package com.proj.webapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.webapp.model.Client;
import com.proj.webapp.service.ClientService;
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

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController
{
    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<Client> create(@RequestBody @Valid Client body)
    {
        var saved = clientService.create(body);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/{id}")
    public Client get(@PathVariable Long id)
    {
        return clientService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Client>> list(
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
        int pageIndex = s / size;

        String sortProperty = (sortField == null || sortField.isBlank()) ? "id" : sortField;
        Sort.Direction direction =
                "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageIndex, size, direction, sortProperty);

        Page<Client> page = clientService.listPaged(q, pageable);

        long total = page.getTotalElements();
        int from = pageIndex * size;
        int to = page.getNumberOfElements() == 0 ? 0 : (from + page.getNumberOfElements() - 1);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "clients " + from + "-" + to + "/" + total);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @RequestBody @Valid Client body)
    {
        return clientService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        clientService.delete(id);
    }

}


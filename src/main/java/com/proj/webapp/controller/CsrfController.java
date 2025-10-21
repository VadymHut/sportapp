package com.proj.webapp.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
public class CsrfController
{
    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token)
    {
        return token;
    }
}

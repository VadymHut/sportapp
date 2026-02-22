package com.proj.webapp.config;

import com.proj.webapp.service.AppUserService;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class LastLoginListener implements ApplicationListener<InteractiveAuthenticationSuccessEvent> {

    private final AppUserService appUserService;

    public LastLoginListener(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @Override
    public void onApplicationEvent(InteractiveAuthenticationSuccessEvent event) {
        appUserService.recordLogin(event.getAuthentication().getName());
    }
}

package com.proj.webapp.config;

import com.proj.webapp.repo.AppUserRepo;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class LastLoginListener implements ApplicationListener<InteractiveAuthenticationSuccessEvent>
{
    private final AppUserRepo appUserRepo;

    public LastLoginListener(AppUserRepo appUserRepo)
    {
        this.appUserRepo = appUserRepo;
    }

    @Override
    public void onApplicationEvent(InteractiveAuthenticationSuccessEvent event)
    {
        String login = event.getAuthentication().getName().toLowerCase();
        appUserRepo.findByLogin(login).ifPresent(u -> {
            u.setLastLoginAt(Instant.now());
        });
    }
}

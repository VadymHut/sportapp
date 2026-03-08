/*
package com.proj.webapp.config;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Role;
import com.proj.webapp.model.Staff;
import com.proj.webapp.repo.AppUserRepo;
import com.proj.webapp.repo.StaffRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapAdmin {

    @Value("${bootstrap.admin.login}")
    private String adminLogin;

    @Value("${bootstrap.admin.password}")
    private String adminPassword;

    @Bean
    CommandLineRunner createAdminIfEmpty(
            StaffRepo staffRepo,
            AppUserRepo appUserRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (appUserRepo.count() > 0) return;

            if (adminLogin == null || adminLogin.isBlank()
                    || adminPassword == null || adminPassword.isBlank()) {
                System.out.println("Admin credentials not set; skipping admin creation.");
                return;
            }

            Staff staff = new Staff();
            staff.setName("System");
            staff.setSurname("Admin");
            staff.setPersonalCode("999999-99991");
            staff.setEmail("admin2@example.com");
            staff.setJobTitle("Administrator");
            staff = staffRepo.save(staff);

            AppUser admin = AppUser.create(staff, adminLogin, passwordEncoder.encode(adminPassword), Role.ROLE_ADMIN);
            appUserRepo.save(admin);

            System.out.println("Admin user created: login=" + adminLogin);
        };
    }
}

 */
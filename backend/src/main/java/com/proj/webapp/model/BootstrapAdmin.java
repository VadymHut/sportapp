package com.proj.webapp.model;

import com.proj.webapp.repo.AppUserRepo;
import com.proj.webapp.repo.StaffRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapAdmin {

    @Value("${bootstrap.admin.login:admin}")
    private String adminLogin;

    @Value("${bootstrap.admin.password:}")
    private String adminPassword;

    @Value("${bootstrap.test.login:test123}")
    private String testLogin;

    @Value("${bootstrap.test.password:}")
    private String testPassword;

    @Bean
    CommandLineRunner createAdminIfEmpty(StaffRepo staffRepo,
                                         AppUserRepo appUserRepo,
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            if (appUserRepo.count() > 0) return;
            if (adminPassword == null || adminPassword.isBlank()) {
                System.out.println("Admin password not set; skipping admin creation.");
                return;
            }

            Staff staff = new Staff();
            staff.setName("System");
            staff.setSurname("Admin");
            staff.setPersonalCode("999999-99999");
            staff.setEmail("admin@example.com");
            staff.setJobTitle("Administrator");
            staff = staffRepo.save(staff);

            AppUser admin = new AppUser();
            admin.setStaff(staff);
            admin.setLogin(adminLogin);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ROLE_ADMIN);
            appUserRepo.save(admin);

            System.out.println("Admin user created: login=" + adminLogin);
        };
    }

    @Bean
    CommandLineRunner createAdminTestProfile(StaffRepo staffRepo,
                                             AppUserRepo appUserRepo,
                                             PasswordEncoder passwordEncoder) {
        return args -> {
            if (appUserRepo.count() > 2) return;
            if (testPassword == null || testPassword.isBlank()) {
                System.out.println("Test password not set; skipping test admin creation.");
                return;
            }

            Staff staff = new Staff();
            staff.setName("Carol");
            staff.setSurname("Johnson");
            staff.setPersonalCode("999997-99999");
            staff.setEmail("admin3@example.com");
            staff.setJobTitle("Administrator");
            staff = staffRepo.save(staff);

            AppUser admin = new AppUser();
            admin.setStaff(staff);
            admin.setLogin(testLogin);
            admin.setPassword(passwordEncoder.encode(testPassword));
            admin.setRole(Role.ROLE_ADMIN);
            appUserRepo.save(admin);

            System.out.println("Admin user created: login=" + testLogin);
        };
    }
}
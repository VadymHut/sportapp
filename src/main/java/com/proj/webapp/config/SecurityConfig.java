package com.proj.webapp.config;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.repo.AppUserRepo;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }


    @Bean
    SecurityFilterChain security(HttpSecurity http, DaoAuthenticationProvider provider) throws Exception
    {
        return http
                .authenticationProvider(provider)
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/csrf", "/login", "/logout").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.GET,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**",
                                "/api/checkins/**"
                        ).hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/checkins/**").hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/checkins/**").hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/checkins/**").hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/checkins/**").hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")

                        .requestMatchers(HttpMethod.POST,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**"
                        ).hasAnyRole("CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**"
                        ).hasAnyRole("CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**"
                        ).hasAnyRole("CASHIER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**"
                        ).hasAnyRole("CASHIER","ADMIN")

                        .requestMatchers("/api/staff/**", "/api/app-users/**").hasRole("ADMIN")

                        .requestMatchers("/api/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                )
                .build();
    }


    @Bean
    UserDetailsService userDetailsService(AppUserRepo appUserRepo)
    {
        return username -> {
            String login = username.trim().toLowerCase();
            AppUser u = appUserRepo.findByLogin(login).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            var auths = List.of(new SimpleGrantedAuthority(u.getRole().name()));
            return new User(u.getLogin(), u.getPassword(), auths);
        };
    }

    @Bean
    DaoAuthenticationProvider authProvider(UserDetailsService uds, PasswordEncoder pe)
    {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(pe);
        return p;
    }
}

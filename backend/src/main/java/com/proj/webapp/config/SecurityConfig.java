package com.proj.webapp.config;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.repo.AppUserRepo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
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
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.http.HttpMethod.GET;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var c = new CorsConfiguration();
        c.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Content-Range"));
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);
        var src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, DaoAuthenticationProvider provider) throws Exception {
        RequestMatcher apiMatcher = req -> {
            String ctx = req.getContextPath() == null ? "" : req.getContextPath();
            String path = req.getRequestURI().substring(ctx.length());
            return path.startsWith("/api/");
        };
        RequestMatcher loginMatcher  = req -> req.getRequestURI().equals(req.getContextPath() + "/login");
        RequestMatcher logoutMatcher = req -> req.getRequestURI().equals(req.getContextPath() + "/logout");

        var csrfRepo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepo.setCookiePath("/");

        var csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
        csrfRequestHandler.setCsrfRequestAttributeName("_csrf");

        return http
                .authenticationProvider(provider)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepo)
                        .csrfTokenRequestHandler(csrfRequestHandler)
                        .ignoringRequestMatchers(loginMatcher, logoutMatcher)
                )
                .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), apiMatcher
                ))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/csrf", "/login", "/logout", "/api/me").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/account/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/account/users/*/set-password").hasRole("ADMIN")

                        .requestMatchers(GET, "/api/trainers/*/info").hasAnyRole("ADMIN","CASHIER")

                        .requestMatchers(GET, "/api/analytics/**").hasAnyRole("RECEPTIONIST","CASHIER","ADMIN")

                        .requestMatchers(GET,
                                "/api/clients/**",
                                "/api/trainers/**",
                                "/api/memberships/**",
                                "/api/membership-plans/**",
                                "/api/plan-prices/**",
                                "/api/checkins/**",
                                "/api/enums/**",
                                "/api/app-users/staffinfo/**"
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
                        .successHandler((req, res, auth) -> res.setStatus(200))
                        .failureHandler((req, res, ex) -> res.setStatus(401))
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                        .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                )
                .build();
    }

    @Bean
    UserDetailsService userDetailsService(AppUserRepo appUserRepo) {
        return username -> {
            String login = username.trim().toLowerCase();
            AppUser u = appUserRepo.findByLogin(login)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            var auths = List.of(new SimpleGrantedAuthority(u.getRole().name()));
            return new User(u.getLogin(), u.getPassword(), auths);
        };
    }

    @Bean
    DaoAuthenticationProvider authProvider(UserDetailsService uds, PasswordEncoder pe) {
        var p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(pe);
        return p;
    }
}

// SecurityConfig.java
package Bu.Microservice.utilisateur.Security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    @Autowired
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // ✅ Le constructeur prend UserDetailsService en paramètre
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/utilisateurs/inscription").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/utilisateurs/init-admin").permitAll() //  temporaire
                        // Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Endpoints appelés par les autres microservices (Feign)
                        .requestMatchers("/api/utilisateurs/{id}").permitAll()
                        .requestMatchers("/api/utilisateurs/{id}/ajouter-penalite").permitAll()
                        .requestMatchers("/api/utilisateurs/{id}/payer-penalite").permitAll()
                        .requestMatchers("/api/utilisateurs/*/verifier-emprunt").permitAll()
                        .requestMatchers("/api/utilisateurs/*/incrementer-prets").permitAll()
                        .requestMatchers("/api/utilisateurs/*/decrementer-prets").permitAll()
                        .requestMatchers("/api/utilisateurs/*/ajouter-penalite").permitAll()
                        .requestMatchers("/api/utilisateurs/*/payer-penalite").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/utilisateurs/*/notifications").permitAll()
                        // Endpoints protégés
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/bibliothecaire/**").hasAnyRole("ADMIN", "BIBLIOTHECAIRE")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
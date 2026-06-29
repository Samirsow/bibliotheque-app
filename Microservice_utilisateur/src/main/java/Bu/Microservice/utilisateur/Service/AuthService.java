// AuthService.java
package Bu.Microservice.utilisateur.Service;

import Bu.Microservice.utilisateur.Dto.LoginReponseDTO;
import Bu.Microservice.utilisateur.Dto.LoginRequestDTO;
import Bu.Microservice.utilisateur.Model.Utilisateur;
import Bu.Microservice.utilisateur.Repository.UtilisateurRepository;
import Bu.Microservice.utilisateur.Security.CustomUserDetails;
import Bu.Microservice.utilisateur.Security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authentification et génération du token JWT
     */
    public LoginReponseDTO authenticate(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getMotDePasse()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Mettre à jour la date de dernière connexion
        Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        if (utilisateur != null) {
            utilisateurRepository.updateDerniereConnexion(utilisateur.getId());
        }

        String jwt = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return LoginReponseDTO.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .roles(userDetails.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .collect(java.util.stream.Collectors.toList()))
                .build();
    }
}
// AuthController.java
package Bu.Microservice.utilisateur.Controller;

import Bu.Microservice.utilisateur.Dto.InscriptionRequestDTO;
import Bu.Microservice.utilisateur.Dto.LoginReponseDTO;
import Bu.Microservice.utilisateur.Dto.LoginRequestDTO;
import Bu.Microservice.utilisateur.Dto.UtilisateurReponseDTO;
import Bu.Microservice.utilisateur.Service.AuthService;
import Bu.Microservice.utilisateur.Service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UtilisateurService utilisateurService;

    /**
     * POST /api/auth/login - Connexion
     */
    @PostMapping("/login")
    public ResponseEntity<LoginReponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        LoginReponseDTO response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/inscription - Inscription (crée un compte MEMBRE)
     */
    @PostMapping("/inscription")
    public ResponseEntity<UtilisateurReponseDTO> inscription(@Valid @RequestBody InscriptionRequestDTO request) {
        UtilisateurReponseDTO response = utilisateurService.inscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
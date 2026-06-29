// AdminController.java
package Bu.Microservice.utilisateur.Controller;

import Bu.Microservice.utilisateur.Dto.InscriptionRequestDTO;
import Bu.Microservice.utilisateur.Dto.ModifierUtilisateurDTO;
import Bu.Microservice.utilisateur.Dto.UtilisateurReponseDTO;
import Bu.Microservice.utilisateur.Service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UtilisateurService utilisateurService;

    /**
     * POST /api/admin/utilisateurs - Créer un utilisateur avec rôle spécifique
     */
    @PostMapping("/utilisateurs")
    public ResponseEntity<UtilisateurReponseDTO> creerUtilisateur(
            @Valid @RequestBody InscriptionRequestDTO request,
            @RequestParam String role) {
        UtilisateurReponseDTO response = utilisateurService.creerUtilisateur(request, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/admin/utilisateurs/{id}/bloquer - Bloquer un utilisateur
     */
    @PutMapping("/utilisateurs/{id}/bloquer")
    public ResponseEntity<Map<String, String>> bloquerUtilisateur(@PathVariable Long id) {
        utilisateurService.bloquerUtilisateur(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur bloqué avec succès"));
    }

    /**
     * PUT /api/admin/utilisateurs/{id}/debloquer - Débloquer un utilisateur
     */
    @PutMapping("/utilisateurs/{id}/debloquer")
    public ResponseEntity<Map<String, String>> debloquerUtilisateur(@PathVariable Long id) {
        utilisateurService.debloquerUtilisateur(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur débloqué avec succès"));
    }

    /**
     * PUT /api/admin/utilisateurs/{id}/role - Modifier le rôle d'un utilisateur
     */
    @PutMapping("/utilisateurs/{id}/role")
    public ResponseEntity<Map<String, String>> modifierRole(
            @PathVariable Long id,
            @RequestParam String role) {
        utilisateurService.modifierRole(id, role);
        return ResponseEntity.ok(Map.of("message", "Rôle modifié avec succès"));
    }

    /**
     * DELETE /api/admin/utilisateurs/{id} - Supprimer un utilisateur
     */
    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Map<String, String>> supprimerUtilisateur(@PathVariable Long id) {
        utilisateurService.bloquerUtilisateur(id); // Soft delete
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
    }
    /**
     * PUT /api/admin/utilisateurs/{id} - Modifier nom/prénom/email/mot de passe d'un utilisateur
     */
    @PutMapping("/utilisateurs/{id}")
    public ResponseEntity<UtilisateurReponseDTO> modifierUtilisateur(
            @PathVariable Long id,
            @Valid @RequestBody ModifierUtilisateurDTO request) {
        UtilisateurReponseDTO response = utilisateurService.modifierUtilisateurAdmin(id, request);
        return ResponseEntity.ok(response);
    }
}
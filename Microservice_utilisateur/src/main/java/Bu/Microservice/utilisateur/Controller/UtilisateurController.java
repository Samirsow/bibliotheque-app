package Bu.Microservice.utilisateur.Controller;

import Bu.Microservice.utilisateur.Dto.InscriptionRequestDTO;
import Bu.Microservice.utilisateur.Dto.UtilisateurReponseDTO;
import Bu.Microservice.utilisateur.Dto.VerifierEmpruntDTO;
import Bu.Microservice.utilisateur.Service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    /**
     * GET /api/utilisateurs/me - Profil de l'utilisateur connecté
     */
    @GetMapping("/Moi")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurReponseDTO> getMonProfil(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurById(userId));
    }

    /**
     * GET /api/utilisateurs/{id} - Détail d'un utilisateur (admin ou bibliothécaire)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BIBLIOTHECAIRE')")
    public ResponseEntity<UtilisateurReponseDTO> getUtilisateurById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurById(id));
    }

    /**
     * GET /api/utilisateurs/email/{email} - Recherche par email
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BIBLIOTHECAIRE')")
    public ResponseEntity<UtilisateurReponseDTO> getUtilisateurByEmail(@PathVariable String email) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurByEmail(email));
    }

    // GET /api/utilisateurs/{id}/notifications
    @GetMapping("/{id}/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMesNotifications(
            @PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getMesNotifications(id));
    }

    /**
     * GET /api/utilisateurs - Liste tous les utilisateurs
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BIBLIOTHECAIRE')")
    public ResponseEntity<List<UtilisateurReponseDTO>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }

    /**
     * GET /api/utilisateurs/{id}/verifier-emprunt - Vérifier si l'utilisateur peut emprunter
     * (Appelé par Emprunt Service)
     */
    @GetMapping("/{id}/verifier-emprunt")
    public ResponseEntity<VerifierEmpruntDTO> verifierEligibiliteEmprunt(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.verifierEligibiliteEmprunt(id));
    }

    /**
     * PUT /api/utilisateurs/{id}/incrementer-prets - Incrémenter prêts actifs
     * (Appelé par Emprunt Service)
     */
    @PutMapping("/{id}/incrementer-prets")
    public ResponseEntity<Void> incrementerPretsActifs(@PathVariable Long id) {
        utilisateurService.incrementerPretsActifs(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/utilisateurs/{id}/decrementer-prets - Décrémenter prêts actifs
     * (Appelé par Emprunt Service)
     */
    @PutMapping("/{id}/decrementer-prets")
    public ResponseEntity<Void> decrementerPretsActifs(@PathVariable Long id) {
        utilisateurService.decrementerPretsActifs(id);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}/ajouter-penalite")
    public ResponseEntity<Void> ajouterPenalite(@PathVariable Long id, @RequestParam Double montant) {
        utilisateurService.ajouterPenalite(id, montant);
        return ResponseEntity.ok().build();
    }

    /**
     *  payer-penalite
     */
    @PutMapping("/{id}/payer-penalite")
    public ResponseEntity<Void> payerPenalite(@PathVariable Long id, @RequestParam Double montant) {
        utilisateurService.payerPenalite(id, montant);
        return ResponseEntity.ok().build();
    }
    // Endpoint temporaire sans sécurité pour créer le premier admin
    @PostMapping("/init-admin")
    public ResponseEntity<UtilisateurReponseDTO> initAdmin(
            @RequestBody InscriptionRequestDTO request) {
        UtilisateurReponseDTO response = utilisateurService.creerUtilisateur(request, "ROLE_ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
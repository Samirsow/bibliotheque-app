package Bu.Microservice.penalite.Controller;


import Bu.Microservice.penalite.Dto.CalculPenaliteDTO;
import Bu.Microservice.penalite.Dto.PaiementPenaliteDTO;
import Bu.Microservice.penalite.Dto.PenaliteReponseDTO;
import Bu.Microservice.penalite.Dto.PenaliteRequeteDTO;
import Bu.Microservice.penalite.Service.PenaliteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/penalites")
@RequiredArgsConstructor
public class PenaliteController {

    private final PenaliteService penaliteService;

    /**
     * POST /api/penalites/calculer - Calculer une pénalité (sans l'enregistrer)
     */
    @PostMapping("/calculer")
    public ResponseEntity<CalculPenaliteDTO> calculerPenalite(@RequestParam Integer joursRetard) {
        CalculPenaliteDTO resultat = penaliteService.calculerPenalite(joursRetard);
        return ResponseEntity.ok(resultat);
    }

    /**
     * POST /api/penalites - Créer une nouvelle pénalité
     */
    @PostMapping
    public ResponseEntity<PenaliteReponseDTO> creerPenalite(@Valid @RequestBody PenaliteRequeteDTO requete) {
        PenaliteReponseDTO penalite = penaliteService.creerPenalite(requete);
        return ResponseEntity.status(HttpStatus.CREATED).body(penalite);
    }

    /**
     * POST /api/penalites/auto - Créer une pénalité automatique
     */
    @PostMapping("/auto")
    public ResponseEntity<PenaliteReponseDTO> creerPenaliteAutomatique(
            @RequestParam Long empruntId,
            @RequestParam Long utilisateurId,
            @RequestParam Integer joursRetard) {
        PenaliteReponseDTO penalite = penaliteService.creerPenaliteAutomatique(empruntId, utilisateurId, joursRetard);
        return ResponseEntity.status(HttpStatus.CREATED).body(penalite);
    }

    /**
     * GET /api/penalites - Toutes les pénalités
     */
    @GetMapping
    public ResponseEntity<List<PenaliteReponseDTO>> getAllPenalites() {
        List<PenaliteReponseDTO> penalites = penaliteService.getAllPenalitesImpayees();
        return ResponseEntity.ok(penalites);
    }

    /**
     * GET /api/penalites/{id} - Pénalité par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PenaliteReponseDTO> getPenaliteById(@PathVariable Long id) {
        PenaliteReponseDTO penalite = penaliteService.getPenaliteById(id);
        return ResponseEntity.ok(penalite);
    }

    /**
     * GET /api/penalites/emprunt/{empruntId} - Pénalité d'un emprunt
     */
    @GetMapping("/emprunt/{empruntId}")
    public ResponseEntity<PenaliteReponseDTO> getPenaliteByEmpruntId(@PathVariable Long empruntId) {
        PenaliteReponseDTO penalite = penaliteService.getPenaliteByEmpruntId(empruntId);
        return ResponseEntity.ok(penalite);
    }

    /**
     * GET /api/penalites/utilisateur/{utilisateurId} - Pénalités d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<PenaliteReponseDTO>> getPenalitesByUtilisateur(@PathVariable Long utilisateurId) {
        List<PenaliteReponseDTO> penalites = penaliteService.getPenalitesByUtilisateur(utilisateurId);
        return ResponseEntity.ok(penalites);
    }

    /**
     * GET /api/penalites/utilisateur/{utilisateurId}/impayees - Pénalités impayées d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}/impayees")
    public ResponseEntity<List<PenaliteReponseDTO>> getPenalitesImpayeesByUtilisateur(@PathVariable Long utilisateurId) {
        List<PenaliteReponseDTO> penalites = penaliteService.getPenalitesImpayeesByUtilisateur(utilisateurId);
        return ResponseEntity.ok(penalites);
    }

    /**
     * GET /api/penalites/impayees - Toutes les pénalités impayées
     */
    @GetMapping("/impayees")
    public ResponseEntity<List<PenaliteReponseDTO>> getAllPenalitesImpayees() {
        List<PenaliteReponseDTO> penalites = penaliteService.getAllPenalitesImpayees();
        return ResponseEntity.ok(penalites);
    }

    /**
     * GET /api/penalites/utilisateur/{utilisateurId}/total - Total impayé d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}/total")
    public ResponseEntity<Map<String, Object>> getTotalImpayeByUtilisateur(@PathVariable Long utilisateurId) {
        Double total = penaliteService.getTotalImpayeByUtilisateur(utilisateurId);
        boolean aDesPenalites = penaliteService.hasPenalitesImpayees(utilisateurId);

        Map<String, Object> response = new HashMap<>();
        response.put("utilisateurId", utilisateurId);
        response.put("totalImpaye", total);
        response.put("aDesPenalites", Optional.of(aDesPenalites));

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/penalites/payer - Payer une pénalité
     */
    @PutMapping("/payer")
    public ResponseEntity<PenaliteReponseDTO> payerPenalite(@Valid @RequestBody PaiementPenaliteDTO paiement) {
        PenaliteReponseDTO penalite = penaliteService.payerPenalite(paiement);
        return ResponseEntity.ok(penalite);
    }

    /**
     * DELETE /api/penalites/{id} - Annuler une pénalité
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> annulerPenalite(
            @PathVariable Long id,
            @RequestParam String motif) {
        penaliteService.annulerPenalite(id, motif);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Pénalité annulée avec succès");
        response.put("motif", motif);

        return ResponseEntity.ok(response);
    }
}
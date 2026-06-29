// EmpruntController.java - Version modifiée
package microservice.Bu.Emprunt.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import microservice.Bu.Emprunt.Dto.EmpruntReponseDTO;
import microservice.Bu.Emprunt.Dto.EmpruntRequeteDTO;
import microservice.Bu.Emprunt.Dto.RetourReponseDTO;
import microservice.Bu.Emprunt.Service.EmpruntService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emprunts")
@RequiredArgsConstructor
public class EmpruntController {

    private final EmpruntService empruntService;

    /**
     * GET /api/emprunts - Liste de tous les emprunts
     */
    @GetMapping
    public ResponseEntity<List<EmpruntReponseDTO>> getAllEmprunts() {
        List<EmpruntReponseDTO> emprunts = empruntService.getAllEmprunts();
        return ResponseEntity.ok(emprunts);
    }

    /**
     * NOUVEAU : POST /api/emprunts/demande - Demande d'emprunt par un membre
     * Statut initial : EN_ATTENTE
     */
    @PostMapping("/demande")
    public ResponseEntity<EmpruntReponseDTO> demanderEmprunt(@Valid @RequestBody EmpruntRequeteDTO requete) {
        EmpruntReponseDTO response = empruntService.demanderEmprunt(requete);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     *  NOUVEAU : PUT /api/emprunts/{id}/valider - Valider un emprunt (bibliothécaire)
     * Statut : EN_ATTENTE -> EN_COURS
     */
    @PutMapping("/{id}/valider")
    public ResponseEntity<EmpruntReponseDTO> validerEmprunt(@PathVariable Long id) {
        EmpruntReponseDTO response = empruntService.validerEmprunt(id);
        return ResponseEntity.ok(response);
    }

    /**
     * NOUVEAU : PUT /api/emprunts/{id}/refuser - Refuser un emprunt (bibliothécaire)
     * Statut : EN_ATTENTE -> REFUSE
     */
    @PutMapping("/{id}/refuser")
    public ResponseEntity<EmpruntReponseDTO> refuserEmprunt(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String motif = body != null ? body.get("motif") : "Refusé par le bibliothécaire";
        EmpruntReponseDTO response = empruntService.refuserEmprunt(id, motif);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mes-emprunts")
    public ResponseEntity<List<EmpruntReponseDTO>> getMesEmprunts(
            @RequestBody Map<String, Long> body) {

        Long utilisateurId = body.get("utilisateurId");
        if (utilisateurId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<EmpruntReponseDTO> emprunts = empruntService.getEmpruntsByUtilisateur(utilisateurId);
        return ResponseEntity.ok(emprunts);
    }

    /**
     *  NOUVEAU : GET /api/emprunts/demandes-en-attente - Demandes en attente
     */
    @GetMapping("/demandes-en-attente")
    public ResponseEntity<List<EmpruntReponseDTO>> getDemandesEnAttente() {
        System.out.println("🔍 Appel reçu: /demandes-en-attente");
        try {
            List<EmpruntReponseDTO> demandes = empruntService.getDemandesEnAttente();
            System.out.println("📊 Demandes trouvées: " + demandes.size());
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            System.err.println("❌ Erreur: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * POST /api/emprunts - Enregistrer un prêt (bibliothécaire)
     * Crée directement un emprunt avec statut EN_COURS
     */
    @PostMapping
    public ResponseEntity<EmpruntReponseDTO> enregistrerPret(@Valid @RequestBody EmpruntRequeteDTO requete) {
        EmpruntReponseDTO response = empruntService.enregistrerPret(requete);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/emprunts/retour/{id} - Retourner un livre
     */
    @PutMapping("/retour/{id}")
    public ResponseEntity<RetourReponseDTO> retournerLivre(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateRetour) {
        RetourReponseDTO response = empruntService.retournerLivre(id, dateRetour);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/emprunts/utilisateur/{id} - Emprunts d'un utilisateur (tous statuts)
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<EmpruntReponseDTO>> getEmpruntsByUtilisateur(@PathVariable Long utilisateurId) {
        List<EmpruntReponseDTO> emprunts = empruntService.getEmpruntsByUtilisateur(utilisateurId);
        return ResponseEntity.ok(emprunts);
    }

    /**
     * GET /api/emprunts/utilisateur/{id}/historique - Historique des emprunts d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}/historique")
    public ResponseEntity<List<EmpruntReponseDTO>> getHistoriqueUtilisateur(@PathVariable Long utilisateurId) {
        List<EmpruntReponseDTO> historique = empruntService.getHistoriqueUtilisateur(utilisateurId);
        return ResponseEntity.ok(historique);
    }

    /**
     * GET /api/emprunts/livre/{id} - Historique des emprunts d'un livre
     */
    @GetMapping("/livre/{livreId}")
    public ResponseEntity<List<EmpruntReponseDTO>> getHistoriqueLivre(@PathVariable Long livreId) {
        List<EmpruntReponseDTO> historique = empruntService.getHistoriqueLivre(livreId);
        return ResponseEntity.ok(historique);
    }

    /**
     * GET /api/emprunts/{id} - Récupérer un emprunt par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmpruntReponseDTO> getEmpruntById(@PathVariable Long id) {
        EmpruntReponseDTO emprunt = empruntService.getEmpruntById(id);
        return ResponseEntity.ok(emprunt);
    }

    /**
     * GET /api/emprunts/retards - Liste des prêts en retard (admin)
     */
    @GetMapping("/retards")
    public ResponseEntity<List<EmpruntReponseDTO>> getPretsEnRetard() {
        List<EmpruntReponseDTO> retards = empruntService.getPretsEnRetard().stream()
                .map(e -> {
                    EmpruntReponseDTO dto = new EmpruntReponseDTO();
                    dto.setId(e.getId());
                    dto.setUtilisateurId(e.getUtilisateurId());
                    dto.setLivreId(e.getLivreId());
                    dto.setDateEmprunt(e.getDateEmprunt());
                    dto.setDateRetourPrevue(e.getDateRetourPrevue());
                    dto.setStatut(String.valueOf(e.getStatut()));
                    return dto;
                }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(retards);
    }
    /**
     * DELETE /api/emprunts/{id} - Supprimer un emprunt déjà retourné (historique)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerEmprunt(@PathVariable Long id) {
        empruntService.supprimerEmprunt(id);
        return ResponseEntity.ok(Map.of("message", "Emprunt supprimé avec succès"));
    }
}
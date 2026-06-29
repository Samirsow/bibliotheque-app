// LivreController.java
package Bu.micosevice.Livre.Controller;

import Bu.micosevice.Livre.Dto.DisponibiliteDTO;
import Bu.micosevice.Livre.Dto.LivreReponseDTO;
import Bu.micosevice.Livre.Dto.LivreRequeteDTO;
import Bu.micosevice.Livre.Service.LivreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/livres")
@RequiredArgsConstructor
public class LivreController {

    private final LivreService livreService;

    /**
     * GET /api/livres - Récupérer tous les livres
     */
    @GetMapping
    public ResponseEntity<List<LivreReponseDTO>> getAllLivres() {
        return ResponseEntity.ok(livreService.getAllLivres());
    }

    /**
     * GET /api/livres/{id} - Récupérer un livre par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LivreReponseDTO> getLivreById(@PathVariable Long id) throws Throwable {
        return ResponseEntity.ok(livreService.getLivreById(id));
    }

    /**
     * GET /api/livres/isbn/{isbn} - Récupérer un livre par son ISBN
     */
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<LivreReponseDTO> getLivreByIsbn(@PathVariable String isbn) throws Throwable {
        return ResponseEntity.ok(livreService.getLivreByIsbn(isbn));
    }

    /**
     * GET /api/livres/recherche?titre=xxx - Rechercher par titre
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<LivreReponseDTO>> rechercher(
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) String auteur,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String motCle) {

        if (titre != null) {
            return ResponseEntity.ok(livreService.rechercherParTitre(titre));
        } else if (auteur != null) {
            return ResponseEntity.ok(livreService.rechercherParAuteur(auteur));
        } else if (categorie != null) {
            return ResponseEntity.ok(livreService.rechercherParCategorie(categorie));
        } else if (motCle != null) {
            return ResponseEntity.ok(livreService.rechercherParMotCle(motCle));
        } else {
            return ResponseEntity.ok(livreService.getAllLivres());
        }
    }

    /**
     * GET /api/livres/disponibles - Récupérer tous les livres disponibles
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<LivreReponseDTO>> getLivresDisponibles() {
        return ResponseEntity.ok(livreService.getLivresDisponibles());
    }

    /**
     * GET /api/livres/{id}/disponible - Vérifier la disponibilité d'un livre
     */
    @GetMapping("/{id}/disponible")
    public ResponseEntity<DisponibiliteDTO> verifierDisponibilite(@PathVariable Long id) throws Throwable {
        return ResponseEntity.ok(livreService.verifierDisponibilite(id));
    }

    /**
     * POST /api/livres - Créer un nouveau livre
     */
    @PostMapping
    public ResponseEntity<LivreReponseDTO> creerLivre(@Valid @RequestBody LivreRequeteDTO requete) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livreService.creerLivre(requete));
    }

    /**
     * PUT /api/livres/{id} - Mettre à jour un livre
     */
    @PutMapping("/{id}")
    public ResponseEntity<LivreReponseDTO> mettreAJourLivre(
            @PathVariable Long id,
            @Valid @RequestBody LivreRequeteDTO requete) throws Throwable {
        return ResponseEntity.ok(livreService.mettreAJourLivre(id, requete));
    }

    /**
     * PUT /api/livres/{id}/exemplaires?nombre=5 - Mettre à jour le nombre d'exemplaires
     */
    @PutMapping("/{id}/exemplaires")
    public ResponseEntity<LivreReponseDTO> mettreAJourExemplaires(
            @PathVariable Long id,
            @RequestParam Integer nombre) throws Throwable {
        return ResponseEntity.ok(livreService.mettreAJourExemplaires(id, nombre));
    }

    /**
     * PUT /api/livres/{id}/emprunter - Emprunter un livre (appelé par Emprunt Service)
     */
    @PutMapping("/{id}/emprunter")
    public ResponseEntity<DisponibiliteDTO> emprunterLivre(@PathVariable Long id) throws Throwable {
        return ResponseEntity.ok(livreService.emprunterLivre(id));
    }

    /**
     * PUT /api/livres/{id}/retourner - Retourner un livre (appelé par Emprunt Service)
     */
    @PutMapping("/{id}/retourner")
    public ResponseEntity<DisponibiliteDTO> retournerLivre(@PathVariable Long id) throws Throwable {
        return ResponseEntity.ok(livreService.retournerLivre(id));
    }

    /**
     * DELETE /api/livres/{id} - Supprimer un livre (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerLivre(@PathVariable Long id) throws Throwable {
        livreService.supprimerLivre(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Livre supprimé avec succès");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/livres/{id}/definitif - Supprimer définitivement un livre
     */
    @DeleteMapping("/{id}/definitif")
    public ResponseEntity<Map<String, String>> supprimerLivreDefinitivement(@PathVariable Long id) {
        livreService.supprimerLivreDefinitivement(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Livre supprimé définitivement");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/livres/statistiques - Obtenir les statistiques
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_livres", livreService.countTotalLivres());
        stats.put("livres_disponibles", livreService.countLivresDisponibles());
        return ResponseEntity.ok(stats);
    }
}
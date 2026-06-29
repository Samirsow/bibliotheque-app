package microservice.Bu.Emprunt.Client;

import microservice.Bu.Emprunt.Dto.LivreVerificationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "livre-service", url = "http://localhost:8081/gestionlivre")
public interface LivreClient {

    // Vérifier si le livre est disponible
    @GetMapping("/api/livres/{id}/disponible")
    LivreVerificationDTO verifierDisponibilite(@PathVariable("id") Long livreId);

    @GetMapping("/api/livres/{id}")
    LivreVerificationDTO getLivreInfo(@PathVariable("id") Long id);

    // Changer le statut du livre à "emprunté"
    @PutMapping("/api/livres/{id}/emprunter")
    void changerStatutEmprunte(@PathVariable("id") Long livreId);

    // Changer le statut du livre à "disponible"
    @PutMapping("/api/livres/{id}/retourner")
    void changerStatutDisponible(@PathVariable("id") Long livreId);
}

package microservice.Bu.Emprunt.Client;


import microservice.Bu.Emprunt.Dto.UtilisateurVerificationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "utilisateur-service", url = "http://localhost:8082/gestion")
public interface UtilisateurClient {

    @GetMapping("/api/utilisateurs/{id}/verifier-emprunt")
    UtilisateurVerificationDTO verifierEligibilite(
            @PathVariable("id") Long utilisateurId
    );

    @GetMapping("/api/utilisateurs/{id}")
    UtilisateurVerificationDTO getUtilisateurInfo(@PathVariable("id") Long id);

    @PutMapping("/api/utilisateurs/{id}/incrementer-prets")
    void incrementerPretsActifs(
            @PathVariable("id") Long utilisateurId
    );

    @PutMapping("/api/utilisateurs/{id}/decrementer-prets")
    void decrementerPretsActifs(
            @PathVariable("id") Long utilisateurId
    );
}
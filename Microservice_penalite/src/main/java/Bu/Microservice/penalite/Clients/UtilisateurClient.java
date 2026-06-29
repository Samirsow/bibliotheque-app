package Bu.Microservice.penalite.Clients;

import Bu.Microservice.penalite.Dto.UtilisateurInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "utilisateur-service", url = "http://localhost:8082/gestion")
public interface UtilisateurClient {

    @GetMapping("/api/utilisateurs/{id}")
    UtilisateurInfoDTO getUtilisateurById(@PathVariable("id") Long id);

    @PutMapping("/api/utilisateurs/{id}/ajouter-penalite")
    void ajouterPenalite(@PathVariable("id") Long id, @RequestParam("montant") Double montant);

    @PutMapping("/api/utilisateurs/{id}/payer-penalite")
    void payerPenalite(@PathVariable("id") Long id, @RequestParam("montant") Double montant);
}
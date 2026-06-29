
package microservice.Bu.Emprunt.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "penalty-service", url = "http://localhost:8085/gestionpenalite")
public interface PenaliteClient {

    // Créer une pénalité pour retard
    @PostMapping("/api/penalites")
    Map<String, Object> creerPenalite(@RequestBody Map<String, Object> penalite);
}
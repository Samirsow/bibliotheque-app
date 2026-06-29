package Bu.Microservice.penalite.Clients;

import Bu.Microservice.penalite.Dto.EmpruntInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "emprunt-service", url = "http://localhost:8080/gestionemprunt")
public interface EmpruntClient {

    @GetMapping("/api/emprunts/{id}")
    EmpruntInfoDTO getEmpruntById(@PathVariable("id") Long id);
}
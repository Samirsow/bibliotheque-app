// Bu/Microservice/utilisateur/Client/NotificationClient.java
package Bu.Microservice.utilisateur.Client;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import java.util.Map;

@FeignClient(name = "notification-service", url = "http://localhost:8086/gestionnotification")
public interface NotificationClient {

    @GetMapping("/api/notifications/utilisateur/{id}")
    List<Map<String, Object>> getMesNotifications(@PathVariable("id") Long utilisateurId);
}
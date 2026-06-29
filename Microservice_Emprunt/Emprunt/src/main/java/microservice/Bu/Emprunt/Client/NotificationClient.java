
package microservice.Bu.Emprunt.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notification-service", url = "http://localhost:8086/gestionnotification")

public interface NotificationClient {

    // Envoyer une notification
    @PostMapping("/api/notifications")
    void envoyerNotification(@RequestBody Map<String, Object> notification);
}
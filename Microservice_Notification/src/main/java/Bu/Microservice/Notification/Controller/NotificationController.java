package Bu.Microservice.Notification.Controller;

import Bu.Microservice.Notification.Model.Notification;
import Bu.Microservice.Notification.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    //  Appelé par Emprunt Service
    @PostMapping
    public ResponseEntity<Notification> envoyerNotification(
            @RequestBody Map<String, Object> data) {
        Notification notification = notificationService.envoyerNotification(data);
        return ResponseEntity.ok(notification);
    }

    // Historique d'un utilisateur
    @GetMapping("/utilisateur/{id}")
    public ResponseEntity<List<Notification>> getByUtilisateur(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationsByUtilisateur(id));
    }

    //  Toutes les notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }
    // Supprimer une notification par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> supprimerNotification(@PathVariable Long id) {
        notificationService.supprimerNotification(id);
        return ResponseEntity.ok("Notification supprimée avec succès");
    }

    // Supprimer toutes les notifications d'un utilisateur
    @DeleteMapping("/utilisateur/{id}")
    public ResponseEntity<String> supprimerNotificationsUtilisateur(@PathVariable Long id) {
        notificationService.supprimerNotificationsUtilisateur(id);
        return ResponseEntity.ok("Toutes les notifications supprimées");
    }
}
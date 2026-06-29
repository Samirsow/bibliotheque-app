package Bu.Microservice.Notification.Service;

import Bu.Microservice.Notification.Model.Notification;
import Bu.Microservice.Notification.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public Notification envoyerNotification(Map<String, Object> data) {
        Notification notification = new Notification();
        notification.setUtilisateurId(getLong(data, "utilisateurId"));
        notification.setUtilisateurEmail(getString(data, "utilisateurEmail"));
        notification.setType(getString(data, "type"));
        notification.setSujet(getString(data, "sujet"));
        notification.setMessage(getString(data, "message"));

        //  Envoyer l'email si l'adresse est disponible
        if (notification.getUtilisateurEmail() != null) {
            try {
                envoyerEmail(
                        notification.getUtilisateurEmail(),
                        notification.getSujet(),
                        notification.getMessage()
                );
                notification.setStatut("ENVOYE");
                notification.setDateEnvoi(LocalDateTime.now());
                log.info("Email envoyé à {}", notification.getUtilisateurEmail());
            } catch (Exception e) {
                notification.setStatut("ECHEC");
                log.error("Erreur envoi email: {}", e.getMessage());
            }
        } else {
            // Enregistrer sans email
            notification.setStatut("EN_ATTENTE");
            log.info("Notification enregistrée sans email pour utilisateur {}",
                    notification.getUtilisateurId());
        }

        return notificationRepository.save(notification);
    }

    private void envoyerEmail(String destinataire, String sujet, String message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(destinataire);
        mail.setSubject(sujet);
        mail.setText(message);
        mailSender.send(mail);
    }

    public List<Notification> getNotificationsByUtilisateur(Long utilisateurId) {
        return notificationRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Helpers
    private String getString(Map<String, Object> data, String key) {
        Object val = data.get(key);
        return val != null ? val.toString() : null;
    }

    private Long getLong(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null) return null;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long) return (Long) val;
        return Long.parseLong(val.toString());
    }
    public void supprimerNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification non trouvée avec l'ID: " + id);
        }
        notificationRepository.deleteById(id);
        log.info("Notification supprimée: {}", id);
    }

    public void supprimerNotificationsUtilisateur(Long utilisateurId) {
        List<Notification> notifications = notificationRepository
                .findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
        notificationRepository.deleteAll(notifications);
        log.info("Toutes les notifications supprimées pour l'utilisateur: {}", utilisateurId);
    }
}
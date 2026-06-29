package Bu.Microservice.Notification.Repository;

import Bu.Microservice.Notification.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);
    List<Notification> findByStatut(String statut);
    List<Notification> findByType(String type);
}
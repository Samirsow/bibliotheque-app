package Bu.Microservice.Notification.Model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(name = "utilisateur_email")
    private String utilisateurEmail;

    @Column(nullable = false)
    private String type; // CONFIRMATION_EMPRUNT, CONFIRMATION_RETOUR, PENALITE

    private String sujet;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String statut = "ENVOYE"; // ENVOYE, ECHEC, EN_ATTENTE

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
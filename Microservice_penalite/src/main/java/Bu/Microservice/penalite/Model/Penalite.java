// Penalite.java (suite)
package Bu.Microservice.penalite.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "penalites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Penalite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emprunt_id", nullable = false)
    private Long empruntId;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "jours_retard", nullable = false)
    private Integer joursRetard;

    @Column(nullable = false)
    private Double montant;

    @Column(length = 20)
    private String statut ="IMPAYE";  // IMPAYE, PAYE, ANNULE

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    @Column(length = 100)
    private String raison;  // RETARD, DOMMAGE, PERTE

    @Column(length = 255)
    private String description;

    @Column(name = "transaction_id")
    private String transactionId;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
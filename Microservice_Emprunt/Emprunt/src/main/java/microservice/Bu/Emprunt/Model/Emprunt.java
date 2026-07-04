// Model/Emprunt.java
package microservice.Bu.Emprunt.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Emprunt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Long utilisateurId;
    private Long livreId;

    private LocalDate dateEmprunt;
    private LocalDate dateRetourPrevue;
    private LocalDate dateRetour;
    private LocalDate dateValidation;  //  NOUVEAU : Date de validation
    @Column(name = "statut", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Statut statut;

    @Column(columnDefinition = "TEXT")
    private String motifRefus;  //  NOUVEAU : Motif du refus
}
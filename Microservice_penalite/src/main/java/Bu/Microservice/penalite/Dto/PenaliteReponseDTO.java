package Bu.Microservice.penalite.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PenaliteReponseDTO {
    private Long id;
    private Long empruntId;
    private Long utilisateurId;
    private Integer joursRetard;
    private Double montant;
    private String statut;
    private LocalDateTime dateCreation;
    private LocalDateTime datePaiement;
    private String raison;
    private String description;
}
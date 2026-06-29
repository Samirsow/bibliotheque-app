package Bu.Microservice.penalite.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculPenaliteDTO {
    private Long empruntId;
    private Long utilisateurId;
    private Integer joursRetard;
    private Double montant;
    private Double tarifParJour;
    private Double plafondMax;
    private String message;
}
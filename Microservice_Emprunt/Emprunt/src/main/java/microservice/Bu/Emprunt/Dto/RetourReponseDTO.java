
package microservice.Bu.Emprunt.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetourReponseDTO {
    private Long empruntId;
    private String message;
    private Integer joursRetard;
    private Double montantPenalite;
    private String statut;
}
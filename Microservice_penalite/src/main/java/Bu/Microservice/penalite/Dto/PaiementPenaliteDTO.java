package Bu.Microservice.penalite.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaiementPenaliteDTO {
    private Long penaliteId;
    private String modePaiement;  // CARTE, ESPECES, VIREMENT
    private String transactionId;
}
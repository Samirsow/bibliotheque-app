package Bu.Microservice.penalite.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PenaliteRequeteDTO {

    @NotNull(message = "L'ID de l'emprunt est obligatoire")
    private Long empruntId;

    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long utilisateurId;

    @Positive(message = "Le nombre de jours de retard doit être positif")
    private Integer joursRetard;

    private String raison;  // RETARD, DOMMAGE, PERTE

    private String description;
}
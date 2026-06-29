package Bu.Microservice.penalite.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurInfoDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Double penalitesImpayees;
    private Boolean actif;
}
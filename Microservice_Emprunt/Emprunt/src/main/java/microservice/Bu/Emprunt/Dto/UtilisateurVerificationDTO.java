
package microservice.Bu.Emprunt.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurVerificationDTO {
    private Long id;
    private String nom;
    private String email;
    private String prenom;
    private Boolean peutEmprunter;
    private Double penalitesImpayees;
    private Integer pretsEnCours;
    private Integer maxPretsAutorises;
    private String message;
}
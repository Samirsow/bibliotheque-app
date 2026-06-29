// VerifierEmpruntDTO.java
package Bu.Microservice.utilisateur.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifierEmpruntDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Boolean peutEmprunter;
    private Double penalitesImpayees;
    private Integer pretsEnCours;
    private Integer maxPretsAutorises;
    private String message;
}
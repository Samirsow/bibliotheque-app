// UtilisateurResponseDTO.java
package Bu.Microservice.utilisateur.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurReponseDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private LocalDateTime dateInscription;
    private Integer pretsActifs;
    private Integer pretsMax;
    private Double penalitesImpayees;
    private Boolean actif;
    private List<String> roles;
}
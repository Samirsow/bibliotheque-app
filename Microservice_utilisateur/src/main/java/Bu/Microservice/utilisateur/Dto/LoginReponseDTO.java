// LoginResponseDTO.java
package Bu.Microservice.utilisateur.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginReponseDTO {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private List<String> roles;
    private Integer pretsActifs;
    private Integer pretsMax;
    private Double penalitesImpayees;
}
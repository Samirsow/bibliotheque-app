
package microservice.Bu.Emprunt.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivreVerificationDTO {
    private Long id;
    private String titre;
    private String auteur;
    private Boolean disponible;
    private String message;
}
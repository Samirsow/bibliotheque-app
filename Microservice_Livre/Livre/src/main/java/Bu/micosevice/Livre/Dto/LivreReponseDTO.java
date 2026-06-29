// LivreReponseDTO.java
package Bu.micosevice.Livre.Dto;

import Bu.micosevice.Livre.Model.Statut;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Builder
public class LivreReponseDTO {
    private Long id;
    private String titre;
    private String auteur;
    private String isbn;
    private String editeur;
    private Integer anneePublication;
    private String categorie;
    private String description;
    private Integer nombreExemplaires;
    private Integer nombreDisponibles;
    private Statut statut;
    private LocalDateTime dateCreation;


}
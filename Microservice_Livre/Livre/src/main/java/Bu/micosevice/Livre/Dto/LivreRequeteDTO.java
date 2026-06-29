// LivreRequeteDTO.java
package Bu.micosevice.Livre.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivreRequeteDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "L'auteur est obligatoire")
    private String auteur;

    private String isbn;

    private String editeur;

    private Integer anneePublication;

    private String categorie;

    private String description;

    @Positive(message = "Le nombre d'exemplaires doit être positif")
    private Integer nombreExemplaires = 1;
}
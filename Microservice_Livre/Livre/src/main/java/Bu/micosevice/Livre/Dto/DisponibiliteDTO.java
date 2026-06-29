// DisponibiliteDTO.java
package Bu.micosevice.Livre.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteDTO {
    private Long id;
    private String titre;
    private String auteur;
    private Boolean disponible;
    private String message;
    private Integer nombreDisponibles;
}
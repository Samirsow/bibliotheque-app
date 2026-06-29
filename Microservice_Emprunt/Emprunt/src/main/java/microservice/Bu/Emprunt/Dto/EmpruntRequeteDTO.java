
package microservice.Bu.Emprunt.Dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jetbrains.annotations.NotNull;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpruntRequeteDTO {


    private Long utilisateurId;


    private Long livreId;

    private LocalDate dateRetourPrevue;
}
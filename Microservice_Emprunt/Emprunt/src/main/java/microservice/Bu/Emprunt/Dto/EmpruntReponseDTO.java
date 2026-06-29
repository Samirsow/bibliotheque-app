// Dto/EmpruntReponseDTO.java
package microservice.Bu.Emprunt.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmpruntReponseDTO {
    private Integer id;
    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private String utilisateurEmail;
    private Long livreId;
    private String livreTitre;
    private String livreAuteur;
    private LocalDate dateEmprunt;
    private LocalDate dateRetourPrevue;
    private LocalDate dateRetour;
    private LocalDate dateValidation;
    private String statut;
    private String motifRefus;
    private Integer joursRetard;
    private String message;  
}
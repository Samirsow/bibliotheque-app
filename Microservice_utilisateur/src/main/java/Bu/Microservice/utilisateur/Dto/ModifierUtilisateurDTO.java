package Bu.Microservice.utilisateur.Dto;

import lombok.Data;

@Data
public class ModifierUtilisateurDTO {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse; // optionnel : si vide/null, on ne change pas le mot de passe
    private String telephone;
    private String adresse;
}
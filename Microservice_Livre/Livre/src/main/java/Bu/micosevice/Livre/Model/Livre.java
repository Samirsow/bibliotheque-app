// Livre.java
package Bu.micosevice.Livre.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "livres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Livre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(nullable = false, length = 100)
    private String auteur;

    @Column(unique = true, length = 13)
    private String isbn;

    @Column(length = 100)
    private String editeur;

    @Column(name = "annee_publication")
    private Integer anneePublication;

    @Column(length = 50)
    private String categorie;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "nombre_exemplaires", nullable = false)
    private Integer nombreExemplaires = 1;

    @Column(name = "nombre_disponibles", nullable = false)
    private Integer nombreDisponibles = 1;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Statut statut = Statut.DISPONIBLE;  // DISPONIBLE, INDISPONIBLE, SUPPRIME

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    /**
     * Vérifier si le livre est disponible
     */
    public boolean isDisponible() {
        return Statut.DISPONIBLE.equals(statut) && nombreDisponibles > 0; 
    }

    public void emprunter() {
        if (!isDisponible()) {
            throw new IllegalStateException("Le livre n'est pas disponible");
        }
        nombreDisponibles--;
        if (nombreDisponibles == 0) {
            statut = Statut.INDISPONIBLE;
        }
    }

    public void retourner() {
        if (nombreDisponibles < nombreExemplaires) {
            nombreDisponibles++;
            statut = Statut.DISPONIBLE;
        }
    }
}
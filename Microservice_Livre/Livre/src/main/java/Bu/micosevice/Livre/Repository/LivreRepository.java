// LivreRepository.java
package Bu.micosevice.Livre.Repository;

import Bu.micosevice.Livre.Model.Livre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivreRepository extends JpaRepository<Livre, Long> {

    // Recherche par ISBN
    Optional<Livre> findByIsbn(String isbn);

    // Recherche par titre (contient, insensible à la casse)
    List<Livre> findByTitreContainingIgnoreCase(String titre);

    // Recherche par auteur (contient, insensible à la casse)
    List<Livre> findByAuteurContainingIgnoreCase(String auteur);

    // Recherche par catégorie
    List<Livre> findByCategorie(String categorie);

    // Livres disponibles
    @Query("SELECT l FROM Livre l WHERE l.statut = 'DISPONIBLE' AND l.nombreDisponibles > 0")
    List<Livre> findLivresDisponibles();

    // Livres indisponibles
    @Query("SELECT l FROM Livre l WHERE l.statut = 'INDISPONIBLE' OR l.nombreDisponibles = 0")
    List<Livre> findLivresIndisponibles();

    // Compter les livres disponibles
    @Query("SELECT COUNT(l) FROM Livre l WHERE l.statut = 'DISPONIBLE' AND l.nombreDisponibles > 0")
    long countLivresDisponibles();

    // Recherche multi-critères
    @Query("SELECT l FROM Livre l WHERE " +
            "LOWER(l.titre) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(l.auteur) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(l.isbn) LIKE LOWER(CONCAT('%', :motCle, '%'))")
    List<Livre> rechercherParMotCle(@Param("motCle") String motCle);

    // Décrémenter le nombre d'exemplaires disponibles (emprunt)
    @Modifying
    @Transactional
    @Query("UPDATE Livre l SET l.nombreDisponibles = l.nombreDisponibles - 1, " +
            "l.statut = CASE WHEN l.nombreDisponibles - 1 = 0 THEN 'INDISPONIBLE' ELSE l.statut END " +
            "WHERE l.id = :id AND l.nombreDisponibles > 0")
    int decrementerDisponibles(@Param("id") Long id);

    // Incrémenter le nombre d'exemplaires disponibles (retour)
    @Modifying
    @Transactional
    @Query("UPDATE Livre l SET l.nombreDisponibles = l.nombreDisponibles + 1, " +
            "l.statut = 'DISPONIBLE' WHERE l.id = :id")
    int incrementerDisponibles(@Param("id") Long id);
}
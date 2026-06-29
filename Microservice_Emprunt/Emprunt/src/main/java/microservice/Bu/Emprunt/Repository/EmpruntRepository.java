// Repository/EmpruntRepository.java
package microservice.Bu.Emprunt.Repository;

import microservice.Bu.Emprunt.Model.Emprunt;
import microservice.Bu.Emprunt.Model.Statut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmpruntRepository extends JpaRepository<Emprunt, Integer> {

    // ORRIGÉ : Utilisation de List<Statut> au lieu de Collection
    boolean existsByUtilisateurIdAndLivreIdAndStatutIn(Long utilisateurId, Long livreId, List<Statut> statuts);

    //  NOUVEAU : Récupérer les demandes en attente
    List<Emprunt> findByStatutOrderByDateEmpruntAsc(Statut statut);

    // Existant
    List<Emprunt> findByStatut(Statut statut);

    List<Emprunt> findByUtilisateurIdOrderByDateEmpruntDesc(Long utilisateurId);

    List<Emprunt> findByLivreIdOrderByDateEmpruntDesc(Long livreId);

    @Query("SELECT e FROM Emprunt e ORDER BY e.dateEmprunt DESC")
    List<Emprunt> findAllOrderByDateEmpruntDesc();

    @Query("SELECT e FROM Emprunt e WHERE e.dateRetourPrevue < :date AND e.statut = :statut")
    List<Emprunt> findPretsEnRetard(@Param("date") LocalDate date, @Param("statut") Statut statut);
}
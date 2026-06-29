package Bu.Microservice.penalite.Repository;

import Bu.Microservice.penalite.Model.Penalite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PenaliteRepository extends JpaRepository<Penalite, Long> {

    // Trouver les pénalités d'un utilisateur
    List<Penalite> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);

    // Trouver les pénalités impayées d'un utilisateur
    List<Penalite> findByUtilisateurIdAndStatut(Long utilisateurId, String statut);

    // Trouver les pénalités d'un emprunt
    Optional<Penalite> findByEmpruntId(Long empruntId);

    // Trouver toutes les pénalités impayées
    List<Penalite> findByStatut(String statut);

    // Compter le total des pénalités impayées d'un utilisateur
    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Penalite p WHERE p.utilisateurId = :utilisateurId AND p.statut = 'IMPAYE'")
    Double sumMontantImpayeByUtilisateur(@Param("utilisateurId") Long utilisateurId);

    // Marquer une pénalité comme payée
    @Modifying
    @Transactional
    @Query("UPDATE Penalite p SET p.statut = 'PAYE', p.datePaiement = :datePaiement, p.transactionId = :transactionId WHERE p.id = :id")
    void marquerCommePayee(@Param("id") Long id,
                           @Param("datePaiement") LocalDateTime datePaiement,
                           @Param("transactionId") String transactionId);

    // Annuler une pénalité
    @Modifying
    @Transactional
    @Query("UPDATE Penalite p SET p.statut = 'ANNULE' WHERE p.id = :id")
    void annulerPenalite(@Param("id") Long id);

    // Nombre de pénalités impayées d'un utilisateur
    long countByUtilisateurIdAndStatut(Long utilisateurId, String statut);
}
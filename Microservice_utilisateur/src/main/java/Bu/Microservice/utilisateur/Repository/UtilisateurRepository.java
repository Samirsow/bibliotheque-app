// UtilisateurRepository.java
package Bu.Microservice.utilisateur.Repository;

import Bu.Microservice.utilisateur.Model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Utilisateur> findByActifTrue();

    List<Utilisateur> findByPenalitesImpayeesGreaterThan(Double montant);

    @Query("SELECT u FROM Utilisateur u WHERE u.pretsMax - u.pretsActifs > 0 AND u.actif = true")
    List<Utilisateur> findUtilisateursPouvantEmprunter();

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.pretsActifs = u.pretsActifs + 1 WHERE u.id = :id")
    void incrementerPretsActifs(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.pretsActifs = u.pretsActifs - 1 WHERE u.id = :id AND u.pretsActifs > 0")
    void decrementerPretsActifs(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.penalitesImpayees = u.penalitesImpayees + :montant WHERE u.id = :id")
    void ajouterPenalite(@Param("id") Long id, @Param("montant") Double montant);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.penalitesImpayees = u.penalitesImpayees - :montant WHERE u.id = :id")
    void payerPenalite(@Param("id") Long id, @Param("montant") Double montant);

    @Modifying
    @Transactional
    @Query("UPDATE Utilisateur u SET u.dateDerniereConnexion = CURRENT_TIMESTAMP WHERE u.id = :id")
    void updateDerniereConnexion(@Param("id") Long id);
}
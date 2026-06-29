package Bu.Microservice.penalite.Service;


import Bu.Microservice.penalite.Clients.EmpruntClient;
import Bu.Microservice.penalite.Clients.UtilisateurClient;
import Bu.Microservice.penalite.Dto.*;
import Bu.Microservice.penalite.Model.Penalite;
import Bu.Microservice.penalite.Repository.PenaliteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PenaliteService {

    private final PenaliteRepository penaliteRepository;

    private final EmpruntClient empruntClient;
    private final UtilisateurClient utilisateurClient;

    @Value("${penalite.tarif-par-jour:0.50}")
    private double tarifParJour;

    @Value("${penalite.plafond-max:20.00}")
    private double plafondMax;

    @Value("${penalite.jours-grace:0}")
    private int joursGrace;

    /**
     * Convertir entité en DTO
     */
    private PenaliteReponseDTO toResponseDTO(Penalite penalite) {
        return PenaliteReponseDTO.builder()
                .id(penalite.getId())
                .empruntId(penalite.getEmpruntId())
                .utilisateurId(penalite.getUtilisateurId())
                .joursRetard(penalite.getJoursRetard())
                .montant(penalite.getMontant())
                .statut(penalite.getStatut())
                .dateCreation(penalite.getDateCreation())
                .datePaiement(penalite.getDatePaiement())
                .raison(penalite.getRaison())
                .description(penalite.getDescription())
                .build();
    }

    /**
     * Calculer le montant de la pénalité en fonction des jours de retard
     */
    public CalculPenaliteDTO calculerPenalite(Integer joursRetard) {
        // Appliquer les jours de grâce
        int joursReels = Math.max(0, joursRetard - joursGrace);

        // Calcul du montant
        double montant = joursReels * tarifParJour;

        // Application du plafond
        if (montant > plafondMax) {
            montant = plafondMax;
        }

        String message;
        if (joursRetard <= joursGrace) {
            message = "Aucune pénalité (délai de grâce de " + joursGrace + " jour(s))";
        } else {
            message = "Pénalité calculée : " + joursReels + " jour(s) de retard à " + tarifParJour + "€/jour";
        }

        return CalculPenaliteDTO.builder()
                .joursRetard(Integer.valueOf(joursReels))
                .montant(Double.valueOf(montant))
                .tarifParJour(Double.valueOf(tarifParJour))
                .plafondMax(Double.valueOf(plafondMax))
                .message(message)
                .build();
    }

    /**
     * Calculer la pénalité à partir d'un emprunt
     */
    public CalculPenaliteDTO calculerPenaliteDepuisEmprunt(EmpruntInfoDTO emprunt) {
        LocalDate dateRetour = emprunt.getDateRetourReelle() != null ?
                emprunt.getDateRetourReelle() : LocalDate.now();

        if (dateRetour.isAfter(emprunt.getDateRetourPrevue())) {
            int joursRetard = (int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), dateRetour);
            return calculerPenalite(Integer.valueOf(joursRetard));
        }

        return CalculPenaliteDTO.builder()
                .joursRetard(Integer.valueOf(0))
                .montant(Double.valueOf(0.0))
                .message("Aucun retard")
                .build();
    }

    /**
     * Créer une pénalité pour un emprunt en retard
     */
    @Transactional
    public PenaliteReponseDTO creerPenalite(PenaliteRequeteDTO requete) {
        // Vérifier si une pénalité existe déjà pour cet emprunt
        if (penaliteRepository.findByEmpruntId(requete.getEmpruntId()).isPresent()) {
            throw new RuntimeException("Une pénalité existe déjà pour cet emprunt");
        }

        // Récupérer les informations de l'emprunt
        EmpruntInfoDTO emprunt;
        try {
            emprunt = empruntClient.getEmpruntById(requete.getEmpruntId());
        } catch (Exception e) {
            throw new RuntimeException("Impossible de récupérer l'emprunt: " + e.getMessage());
        }

        // Calculer la pénalité
        CalculPenaliteDTO calcul;
        if (requete.getJoursRetard() != null) {
            calcul = calculerPenalite(requete.getJoursRetard());
        } else {
            calcul = calculerPenaliteDepuisEmprunt(emprunt);
        }

        if (calcul.getMontant() <= 0) {
            throw new RuntimeException("Aucune pénalité à appliquer (pas de retard)");
        }

        // Créer la pénalité
        Penalite penalite = new Penalite();
        penalite.setEmpruntId(requete.getEmpruntId());
        penalite.setUtilisateurId(requete.getUtilisateurId());
        penalite.setJoursRetard(calcul.getJoursRetard());
        penalite.setMontant(calcul.getMontant());
        penalite.setRaison(requete.getRaison() != null ? requete.getRaison() : "RETARD");
        penalite.setDescription(requete.getDescription());
        penalite.setStatut("IMPAYE");

        Penalite savedPenalite = penaliteRepository.save(penalite);

        // Ajouter la pénalité au compte utilisateur
        try {
            utilisateurClient.ajouterPenalite(requete.getUtilisateurId(), calcul.getMontant());
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout de la pénalité à l'utilisateur: {}", e.getMessage());
        }

        log.info("Pénalité créée: {}€ pour {} jours de retard", calcul.getMontant(), calcul.getJoursRetard());

        return toResponseDTO(savedPenalite);
    }

    /**
     * Créer une pénalité automatiquement à partir du retour d'emprunt
     */
    @Transactional
    public PenaliteReponseDTO creerPenaliteAutomatique(Long empruntId, Long utilisateurId, Integer joursRetard) {
        PenaliteRequeteDTO requete = new PenaliteRequeteDTO();
        requete.setEmpruntId(empruntId);
        requete.setUtilisateurId(utilisateurId);
        requete.setJoursRetard(joursRetard);
        requete.setRaison("RETARD");
        requete.setDescription("Pénalité automatique pour retard de retour");

        return creerPenalite(requete);
    }

    /**
     * Payer une pénalité
     */
    @Transactional
    public PenaliteReponseDTO payerPenalite(PaiementPenaliteDTO paiement) {
        Penalite penalite = penaliteRepository.findById(paiement.getPenaliteId())
                .orElseThrow(() -> new RuntimeException("Pénalité non trouvée"));

        if ("PAYE".equals(penalite.getStatut())) {
            throw new RuntimeException("Cette pénalité a déjà été payée");
        }

        // ✅ Mettre à jour directement l'entité au lieu de @Modifying
        penalite.setStatut("PAYE");
        penalite.setDatePaiement(LocalDateTime.now());
        penalite.setTransactionId(paiement.getTransactionId());
        penaliteRepository.save(penalite); // ✅ save directement

        // Mettre à jour le compte utilisateur
        try {
            utilisateurClient.payerPenalite(penalite.getUtilisateurId(), penalite.getMontant());
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du compte utilisateur: {}", e.getMessage());
        }

        log.info("Pénalité payée: {} pour l'utilisateur {}", penalite.getMontant(), penalite.getUtilisateurId());

        return toResponseDTO(penalite); // ✅ retourner l'entité mise à jour directement
    }

    /**
     * Récupérer toutes les pénalités d'un utilisateur
     */
    public List<PenaliteReponseDTO> getPenalitesByUtilisateur(Long utilisateurId) {
        return penaliteRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les pénalités impayées d'un utilisateur
     */
    public List<PenaliteReponseDTO> getPenalitesImpayeesByUtilisateur(Long utilisateurId) {
        return penaliteRepository.findByUtilisateurIdAndStatut(utilisateurId, "IMPAYE").stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer toutes les pénalités impayées
     */
    public List<PenaliteReponseDTO> getAllPenalitesImpayees() {
        return penaliteRepository.findByStatut("IMPAYE").stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une pénalité par ID
     */
    public PenaliteReponseDTO getPenaliteById(Long id) {
        Penalite penalite = penaliteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pénalité non trouvée"));
        return toResponseDTO(penalite);
    }

    /**
     * Récupérer la pénalité d'un emprunt
     */
    public PenaliteReponseDTO getPenaliteByEmpruntId(Long empruntId) {
        Penalite penalite = penaliteRepository.findByEmpruntId(empruntId)
                .orElseThrow(() -> new RuntimeException("Aucune pénalité trouvée pour cet emprunt"));
        return toResponseDTO(penalite);
    }

    /**
     * Annuler une pénalité (pour contestation)
     */
    @Transactional
    public void annulerPenalite(Long id, String motif) {
        Penalite penalite = penaliteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pénalité non trouvée"));

        if ("PAYE".equals(penalite.getStatut())) {
            throw new RuntimeException("Impossible d'annuler une pénalité déjà payée");
        }

        penaliteRepository.annulerPenalite(id);

        // Rembourser ou ajuster le compte utilisateur
        try {
            utilisateurClient.payerPenalite(penalite.getUtilisateurId(), penalite.getMontant());
        } catch (Exception e) {
            log.error("Erreur lors de l'annulation de la pénalité: {}", e.getMessage());
        }

        log.info("Pénalité annulée: {} - Motif: {}", id, motif);
    }

    /**
     * Obtenir le total des pénalités impayées d'un utilisateur
     */
    public Double getTotalImpayeByUtilisateur(Long utilisateurId) {
        return penaliteRepository.sumMontantImpayeByUtilisateur(utilisateurId);
    }

    /**
     * Vérifier si un utilisateur a des pénalités impayées
     */
    public boolean hasPenalitesImpayees(Long utilisateurId) {
        return penaliteRepository.countByUtilisateurIdAndStatut(utilisateurId, "IMPAYE") > 0;
    }
}
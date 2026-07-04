// EmpruntService.java - Version corrigée
package microservice.Bu.Emprunt.Service;

import lombok.RequiredArgsConstructor;
import microservice.Bu.Emprunt.Client.LivreClient;
import microservice.Bu.Emprunt.Client.NotificationClient;
import microservice.Bu.Emprunt.Client.PenaliteClient;
import microservice.Bu.Emprunt.Client.UtilisateurClient;
import microservice.Bu.Emprunt.Dto.*;
import microservice.Bu.Emprunt.Model.Emprunt;
import microservice.Bu.Emprunt.Model.Statut;
import microservice.Bu.Emprunt.Repository.EmpruntRepository;
import microservice.Bu.Emprunt.exception.EmpruntNotFoundException;
import microservice.Bu.Emprunt.exception.LivreIndisponibleException;
import microservice.Bu.Emprunt.exception.UtilisateurNonAutoriseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpruntService {

    private final EmpruntRepository empruntRepository;
    private final LivreClient livreClient;
    private final UtilisateurClient utilisateurClient;
    private final PenaliteClient penaliteClient;
    private final NotificationClient notificationClient;
    private static final double PENALITE_PAR_JOUR = 0.50;
    private static final int DELAI_EMPRUNT_JOURS = 14;

    /**
     *  Demander un emprunt (par un membre)
     * Statut = EN_ATTENTE
     */
    public EmpruntReponseDTO demanderEmprunt(EmpruntRequeteDTO requete) {
        // Vérifier l'éligibilité de l'utilisateur
        UtilisateurVerificationDTO utilisateur = utilisateurClient
                .verifierEligibilite(requete.getUtilisateurId());
        if (!utilisateur.getPeutEmprunter()) {
            throw new UtilisateurNonAutoriseException(
                    "L'utilisateur ne peut pas emprunter: " + utilisateur.getMessage()
            );
        }

        // Vérifier la disponibilité du livre
        LivreVerificationDTO livre = livreClient.verifierDisponibilite(requete.getLivreId());
        if (!livre.getDisponible()) {
            throw new LivreIndisponibleException(
                    "Le livre '" + livre.getTitre() + "' n'est pas disponible"
            );
        }

        // Vérifier si l'utilisateur a déjà une demande ou un emprunt pour ce livre
        boolean dejaEmprunte = empruntRepository.existsByUtilisateurIdAndLivreIdAndStatutIn(
                requete.getUtilisateurId(),
                requete.getLivreId(),
                List.of(Statut.EN_ATTENTE, Statut.EN_COURS)
        );

        if (dejaEmprunte) {
            throw new UtilisateurNonAutoriseException(
                    "Vous avez déjà une demande en attente ou un emprunt en cours pour ce livre"
            );
        }

        // Créer l'emprunt avec statut EN_ATTENTE
        Emprunt emprunt = new Emprunt();
        emprunt.setUtilisateurId(requete.getUtilisateurId());
        emprunt.setLivreId(requete.getLivreId());
        emprunt.setDateEmprunt(LocalDate.now());

        LocalDate dateRetourPrevue = requete.getDateRetourPrevue() != null ?
                requete.getDateRetourPrevue() :
                LocalDate.now().plusDays(DELAI_EMPRUNT_JOURS);
        emprunt.setDateRetourPrevue(dateRetourPrevue);
        emprunt.setStatut(Statut.EN_ATTENTE);

        Emprunt savedEmprunt = empruntRepository.save(emprunt);

        // Notification
        envoyerNotificationDemande(savedEmprunt, utilisateur, livre);

        EmpruntReponseDTO response = mapToResponseDTO(savedEmprunt, utilisateur, livre);
        response.setStatut("EN_ATTENTE");
        response.setMessage("Demande d'emprunt envoyée en attente de validation");

        return response;
    }

    /**
     *  Valider un emprunt par le bibliothécaire
     * Statut : EN_ATTENTE -> EN_COURS
     */
    @Transactional
    public EmpruntReponseDTO validerEmprunt(Long empruntId) {
        Emprunt emprunt = empruntRepository.findById(Math.toIntExact(empruntId))
                .orElseThrow(() -> new EmpruntNotFoundException("Emprunt non trouvé avec l'ID: " + empruntId));

        if (emprunt.getStatut() != Statut.EN_ATTENTE) {
            throw new IllegalStateException("Cet emprunt n'est pas en attente de validation");
        }

        // Vérifier à nouveau la disponibilité du livre
        LivreVerificationDTO livre = livreClient.verifierDisponibilite(emprunt.getLivreId());
        if (!livre.getDisponible()) {
            throw new LivreIndisponibleException("Le livre n'est plus disponible");
        }

        // Mettre à jour le statut
        emprunt.setStatut(Statut.EN_COURS);
        emprunt.setDateValidation(LocalDate.now());

        Emprunt updatedEmprunt = empruntRepository.save(emprunt);

        // Mettre à jour les statuts
        livreClient.changerStatutEmprunte(emprunt.getLivreId());
        utilisateurClient.incrementerPretsActifs(emprunt.getUtilisateurId());

        // Notification
        envoyerNotificationValidation(updatedEmprunt);

        EmpruntReponseDTO response = mapToResponseDTO(updatedEmprunt, null, null);
        response.setStatut("EN_COURS");
        response.setMessage("✅ Emprunt validé !");

        return response;
    }

    /**
     * ✅ Refuser un emprunt par le bibliothécaire
     * Statut : EN_ATTENTE -> REFUSE
     */
    @Transactional
    public EmpruntReponseDTO refuserEmprunt(Long empruntId, String motif) {
        Emprunt emprunt = empruntRepository.findById(Math.toIntExact(empruntId))
                .orElseThrow(() -> new EmpruntNotFoundException("Emprunt non trouvé avec l'ID: " + empruntId));

        if (emprunt.getStatut() != Statut.EN_ATTENTE) {
            throw new IllegalStateException("Cet emprunt n'est pas en attente de validation");
        }

        emprunt.setStatut(Statut.REFUSE);
        emprunt.setMotifRefus(motif != null ? motif : "Refusé par le bibliothécaire");

        Emprunt updatedEmprunt = empruntRepository.save(emprunt);

        // Notification
        envoyerNotificationRefus(updatedEmprunt, motif);

        EmpruntReponseDTO response = mapToResponseDTO(updatedEmprunt, null, null);
        response.setStatut("REFUSE");
        response.setMessage("❌ Demande d'emprunt refusée");

        return response;
    }

    /**
     *  Récupérer toutes les demandes en attente
     */
    public List<EmpruntReponseDTO> getDemandesEnAttente() {
        List<Emprunt> demandes = empruntRepository.findByStatutOrderByDateEmpruntAsc(Statut.EN_ATTENTE);

        return demandes.stream().map(emprunt -> {
            EmpruntReponseDTO dto = new EmpruntReponseDTO();
            dto.setId(emprunt.getId());
            dto.setUtilisateurId(emprunt.getUtilisateurId());
            dto.setLivreId(emprunt.getLivreId());
            dto.setDateEmprunt(emprunt.getDateEmprunt());
            dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
            dto.setStatut(String.valueOf(emprunt.getStatut()));

            try {
                UtilisateurVerificationDTO utilisateur = utilisateurClient.getUtilisateurInfo(emprunt.getUtilisateurId());
                dto.setUtilisateurNom(utilisateur.getNom());
                dto.setUtilisateurPrenom(utilisateur.getPrenom());
                dto.setUtilisateurEmail(utilisateur.getEmail());
            } catch (Exception e) {
                System.err.println(" Erreur getUtilisateurInfo pour id=" + emprunt.getUtilisateurId() + " : " + e.getMessage());
                e.printStackTrace();
            }
            try {
                LivreVerificationDTO livre = livreClient.getLivreInfo(emprunt.getLivreId());
                dto.setLivreTitre(livre.getTitre());
                dto.setLivreAuteur(livre.getAuteur());
            } catch (Exception e) {
                System.err.println(" Erreur getLivreInfo pour id=" + emprunt.getLivreId() + " : " + e.getMessage());
                e.printStackTrace();
            }

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Enregistrer un prêt (pour le bibliothécaire)
     */
    public EmpruntReponseDTO enregistrerPret(EmpruntRequeteDTO requete) {
        UtilisateurVerificationDTO utilisateur = utilisateurClient
                .verifierEligibilite(requete.getUtilisateurId());
        if (!utilisateur.getPeutEmprunter()) {
            throw new UtilisateurNonAutoriseException(
                    "L'utilisateur ne peut pas emprunter: " + utilisateur.getMessage()
            );
        }

        LivreVerificationDTO livre = livreClient.verifierDisponibilite(requete.getLivreId());
        if (!livre.getDisponible()) {
            throw new LivreIndisponibleException(
                    "Le livre '" + livre.getTitre() + "' n'est pas disponible"
            );
        }

        boolean dejaEmprunte = empruntRepository.existsByUtilisateurIdAndLivreIdAndStatutIn(
                requete.getUtilisateurId(),
                requete.getLivreId(),
                List.of(Statut.EN_ATTENTE, Statut.EN_COURS)
        );

        if (dejaEmprunte) {
            throw new UtilisateurNonAutoriseException(
                    "L'utilisateur a déjà une demande ou un emprunt pour ce livre"
            );
        }

        Emprunt emprunt = new Emprunt();
        emprunt.setUtilisateurId(requete.getUtilisateurId());
        emprunt.setLivreId(requete.getLivreId());
        emprunt.setDateEmprunt(LocalDate.now());
        emprunt.setDateRetourPrevue(requete.getDateRetourPrevue() != null ?
                requete.getDateRetourPrevue() :
                LocalDate.now().plusDays(DELAI_EMPRUNT_JOURS));
        emprunt.setStatut(Statut.EN_COURS);

        Emprunt savedEmprunt = empruntRepository.save(emprunt);

        livreClient.changerStatutEmprunte(requete.getLivreId());
        utilisateurClient.incrementerPretsActifs(requete.getUtilisateurId());

        envoyerNotificationEmprunt(savedEmprunt, utilisateur, livre);

        return mapToResponseDTO(savedEmprunt, utilisateur, livre);
    }

    /**
     * Retourner un livre
     */
    @Transactional
    public RetourReponseDTO retournerLivre(Long empruntId, LocalDate dateRetour) {
        Emprunt emprunt = empruntRepository.findById(Math.toIntExact(empruntId))
                .orElseThrow(() -> new EmpruntNotFoundException("Prêt non trouvé avec l'ID: " + empruntId));

        // Vérifier si l'emprunt peut être retourné
        if (Statut.RETOURNE.equals(emprunt.getStatut()) ||
                Statut.REFUSE.equals(emprunt.getStatut())) {
            throw new IllegalStateException("Ce livre ne peut pas être retourné (statut: " + emprunt.getStatut() + ")");
        }

        // Vérifier la pénalité
        try {
            Map<String, Object> penalite = penaliteClient.getPenaliteByEmpruntId(Long.valueOf(emprunt.getId()));
            if (penalite != null && !penalite.isEmpty()) {
                String statutPenalite = (String) penalite.get("statut");
                if ("IMPAYE".equals(statutPenalite)) {
                    throw new IllegalStateException(
                            "⚠️ Une pénalité de " + penalite.get("montant") + "€ est impayée."
                    );
                }
            }
        } catch (Exception e) {
            // Ignorer
        }

        LocalDate dateRetourReelle = dateRetour != null ? dateRetour : LocalDate.now();
        emprunt.setDateRetour(dateRetourReelle);

        int joursRetard = 0;
        double montantPenalite = 0;

        if (dateRetourReelle.isAfter(emprunt.getDateRetourPrevue())) {
            joursRetard = (int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), dateRetourReelle);
            montantPenalite = joursRetard * 0.50;
            //  Utilisation de l'ENUM
            emprunt.setStatut(Statut.EN_RETARD);
        } else {
            emprunt.setStatut(Statut.RETOURNE);
        }

        empruntRepository.save(emprunt);

        livreClient.changerStatutDisponible(emprunt.getLivreId());
        utilisateurClient.decrementerPretsActifs(emprunt.getUtilisateurId());

        // Créer la pénalité si nécessaire
        if (montantPenalite > 0) {
            try {
                Map<String, Object> existingPenalite = penaliteClient.getPenaliteByEmpruntId(Long.valueOf(emprunt.getId()));
                if (existingPenalite == null || existingPenalite.isEmpty()) {
                    Map<String, Object> penaliteData = new HashMap<>();
                    penaliteData.put("utilisateurId", emprunt.getUtilisateurId());
                    penaliteData.put("empruntId", emprunt.getId());
                    penaliteData.put("montant", montantPenalite);
                    penaliteData.put("raison", "RETARD");
                    penaliteData.put("joursRetard", joursRetard);
                    penaliteClient.creerPenalite(penaliteData);
                }
            } catch (Exception e) {
                // Ignorer
            }
        }

        RetourReponseDTO response = new RetourReponseDTO();
        response.setEmpruntId(Long.valueOf(emprunt.getId()));
        response.setMessage("Livre retourné avec succès");
        response.setJoursRetard(joursRetard);
        response.setMontantPenalite(montantPenalite);
        //  Convertir ENUM en String
        response.setStatut(emprunt.getStatut().name());

        return response;
    }

    /**
     * Récupérer les emprunts d'un utilisateur
     */
    public List<EmpruntReponseDTO> getEmpruntsByUtilisateur(Long utilisateurId) {
        List<Emprunt> emprunts = empruntRepository.findByUtilisateurIdOrderByDateEmpruntDesc(utilisateurId);

        return emprunts.stream().map(emprunt -> {
            EmpruntReponseDTO dto = new EmpruntReponseDTO();
            dto.setId(emprunt.getId());
            dto.setUtilisateurId(emprunt.getUtilisateurId());
            dto.setLivreId(emprunt.getLivreId());
            dto.setDateEmprunt(emprunt.getDateEmprunt());
            dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
            dto.setDateRetour(emprunt.getDateRetour());
            dto.setStatut(String.valueOf(emprunt.getStatut()));
            dto.setMotifRefus(emprunt.getMotifRefus());
            dto.setDateValidation(emprunt.getDateValidation());

            if (emprunt.getDateRetour() != null && emprunt.getDateRetour().isAfter(emprunt.getDateRetourPrevue())) {
                dto.setJoursRetard((int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), emprunt.getDateRetour()));
            } else if (Statut.EN_COURS.equals(emprunt.getStatut()) && LocalDate.now().isAfter(emprunt.getDateRetourPrevue())) {
                dto.setJoursRetard((int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), LocalDate.now()));
            } else {
                dto.setJoursRetard(0);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // ========== MÉTHODES EXISTANTES ==========

    public EmpruntReponseDTO getEmpruntById(Long id) {
        Emprunt emprunt = empruntRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new EmpruntNotFoundException("Emprunt non trouvé avec l'ID: " + id));

        EmpruntReponseDTO dto = new EmpruntReponseDTO();
        dto.setId(emprunt.getId());
        dto.setUtilisateurId(emprunt.getUtilisateurId());
        dto.setLivreId(emprunt.getLivreId());
        dto.setDateEmprunt(emprunt.getDateEmprunt());
        dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
        dto.setDateRetour(emprunt.getDateRetour());
        dto.setStatut(String.valueOf(emprunt.getStatut()));
        dto.setJoursRetard(0);
        return dto;
    }

    public List<EmpruntReponseDTO> getHistoriqueUtilisateur(Long utilisateurId) {
        List<Emprunt> emprunts = empruntRepository.findByUtilisateurIdOrderByDateEmpruntDesc(utilisateurId);

        return emprunts.stream().map(emprunt -> {
            EmpruntReponseDTO dto = new EmpruntReponseDTO();
            dto.setId(emprunt.getId());
            dto.setUtilisateurId(emprunt.getUtilisateurId());
            dto.setLivreId(emprunt.getLivreId());
            dto.setDateEmprunt(emprunt.getDateEmprunt());
            dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
            dto.setDateRetour(emprunt.getDateRetour());
            dto.setStatut(String.valueOf(emprunt.getStatut()));

            if (emprunt.getDateRetour() != null && emprunt.getDateRetour().isAfter(emprunt.getDateRetourPrevue())) {
                dto.setJoursRetard((int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), emprunt.getDateRetour()));
            } else if (Statut.EN_COURS.equals(emprunt.getStatut()) && LocalDate.now().isAfter(emprunt.getDateRetourPrevue())) {
                dto.setJoursRetard((int) ChronoUnit.DAYS.between(emprunt.getDateRetourPrevue(), LocalDate.now()));
            } else {
                dto.setJoursRetard(0);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public List<EmpruntReponseDTO> getHistoriqueLivre(Long livreId) {
        List<Emprunt> emprunts = empruntRepository.findByLivreIdOrderByDateEmpruntDesc(livreId);

        return emprunts.stream().map(emprunt -> {
            EmpruntReponseDTO dto = new EmpruntReponseDTO();
            dto.setId(emprunt.getId());
            dto.setUtilisateurId(emprunt.getUtilisateurId());
            dto.setLivreId(emprunt.getLivreId());
            dto.setDateEmprunt(emprunt.getDateEmprunt());
            dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
            dto.setDateRetour(emprunt.getDateRetour());
            dto.setStatut(String.valueOf(emprunt.getStatut()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<EmpruntReponseDTO> getAllEmprunts() {
        List<Emprunt> emprunts = empruntRepository.findAllOrderByDateEmpruntDesc();

        return emprunts.stream().map(emprunt -> {
            EmpruntReponseDTO dto = new EmpruntReponseDTO();
            dto.setId(emprunt.getId());
            dto.setUtilisateurId(emprunt.getUtilisateurId());
            dto.setLivreId(emprunt.getLivreId());
            dto.setDateEmprunt(emprunt.getDateEmprunt());
            dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
            dto.setDateRetour(emprunt.getDateRetour());
            dto.setStatut(String.valueOf(emprunt.getStatut()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<Emprunt> getPretsEnRetard() {
        return empruntRepository.findPretsEnRetard(LocalDate.now(), Statut.EN_COURS);
    }

    // ========== MÉTHODES PRIVÉES ==========

    private EmpruntReponseDTO mapToResponseDTO(Emprunt emprunt, UtilisateurVerificationDTO utilisateur, LivreVerificationDTO livre) {
        EmpruntReponseDTO dto = new EmpruntReponseDTO();
        dto.setId(emprunt.getId());
        dto.setUtilisateurId(emprunt.getUtilisateurId());
        dto.setLivreId(emprunt.getLivreId());
        dto.setDateEmprunt(emprunt.getDateEmprunt());
        dto.setDateRetourPrevue(emprunt.getDateRetourPrevue());
        dto.setDateRetour(emprunt.getDateRetour());
        dto.setStatut(String.valueOf(emprunt.getStatut()));
        dto.setMotifRefus(emprunt.getMotifRefus());
        dto.setDateValidation(emprunt.getDateValidation());

        if (utilisateur != null) {
            dto.setUtilisateurNom(utilisateur.getNom());
            dto.setUtilisateurPrenom(utilisateur.getPrenom());
            dto.setUtilisateurEmail(utilisateur.getEmail());
        }

        if (livre != null) {
            dto.setLivreTitre(livre.getTitre());
            dto.setLivreAuteur(livre.getAuteur());
        }

        return dto;
    }

    private void envoyerNotificationDemande(Emprunt emprunt, UtilisateurVerificationDTO utilisateur, LivreVerificationDTO livre) {
        Map<String, Object> notifUtilisateur = new HashMap<>();
        notifUtilisateur.put("utilisateurId", emprunt.getUtilisateurId());
        notifUtilisateur.put("utilisateurEmail", utilisateur.getEmail());
        notifUtilisateur.put("type", "DEMANDE_EMPRUNT");
        notifUtilisateur.put("sujet", "Demande d'emprunt envoyée");
        notifUtilisateur.put("message", String.format(
                "Bonjour %s,\n\nVotre demande d'emprunt pour le livre '%s' a été envoyée.\n" +
                        "Elle sera traitée par un bibliothécaire dans les plus brefs délais.\n\n" +
                        "Date de retour prévue: %s",
                utilisateur.getPrenom() + " " + utilisateur.getNom(),
                livre.getTitre(),
                emprunt.getDateRetourPrevue()
        ));
        notificationClient.envoyerNotification(notifUtilisateur);
    }

    private void envoyerNotificationValidation(Emprunt emprunt) {
        try {
            UtilisateurVerificationDTO utilisateur = utilisateurClient.getUtilisateurInfo(emprunt.getUtilisateurId());
            LivreVerificationDTO livre = livreClient.getLivreInfo(emprunt.getLivreId());

            Map<String, Object> notification = new HashMap<>();
            notification.put("utilisateurId", emprunt.getUtilisateurId());
            notification.put("utilisateurEmail", utilisateur.getEmail());
            notification.put("type", "VALIDATION_EMPRUNT");
            notification.put("sujet", "✅ Votre emprunt a été validé !");
            notification.put("message", String.format(
                    "Bonjour %s,\n\nVotre demande d'emprunt pour le livre '%s' a été validée.\n" +
                            "Vous pouvez maintenant le récupérer à la bibliothèque.\n\n" +
                            "Date de retour prévue: %s\n" +
                            "N'oubliez pas de le rendre à temps !",
                    utilisateur.getPrenom() + " " + utilisateur.getNom(),
                    livre.getTitre(),
                    emprunt.getDateRetourPrevue()
            ));
            notificationClient.envoyerNotification(notification);
        } catch (Exception e) {
            // Ignorer les erreurs de notification
        }
    }

    private void envoyerNotificationRefus(Emprunt emprunt, String motif) {
        try {
            UtilisateurVerificationDTO utilisateur = utilisateurClient.getUtilisateurInfo(emprunt.getUtilisateurId());
            LivreVerificationDTO livre = livreClient.getLivreInfo(emprunt.getLivreId());

            Map<String, Object> notification = new HashMap<>();
            notification.put("utilisateurId", emprunt.getUtilisateurId());
            notification.put("utilisateurEmail", utilisateur.getEmail());
            notification.put("type", "REFUS_EMPRUNT");
            notification.put("sujet", "❌ Votre demande d'emprunt a été refusée");
            notification.put("message", String.format(
                    "Bonjour %s,\n\nVotre demande d'emprunt pour le livre '%s' a été refusée.\n" +
                            "Motif: %s\n\n" +
                            "N'hésitez pas à contacter la bibliothèque pour plus d'informations.",
                    utilisateur.getPrenom() + " " + utilisateur.getNom(),
                    livre.getTitre(),
                    motif != null ? motif : "Non spécifié"
            ));
            notificationClient.envoyerNotification(notification);
        } catch (Exception e) {
            // Ignorer les erreurs de notification
        }
    }

    private void envoyerNotificationEmprunt(Emprunt emprunt, UtilisateurVerificationDTO utilisateur, LivreVerificationDTO livre) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("utilisateurId", emprunt.getUtilisateurId());
        notification.put("utilisateurEmail", utilisateur.getEmail());
        notification.put("type", "CONFIRMATION_EMPRUNT");
        notification.put("sujet", "Confirmation d'emprunt");
        notification.put("message", String.format(
                "Bonjour %s, vous avez emprunté le livre '%s'.\n" +
                        "Date de retour prévue: %s\n" +
                        "N'oubliez pas de le rendre à temps !",
                utilisateur.getPrenom() + " " + utilisateur.getNom(),
                livre.getTitre(),
                emprunt.getDateRetourPrevue()
        ));
        notificationClient.envoyerNotification(notification);
    }

    private void envoyerNotificationRetour(Emprunt emprunt, int joursRetard, double montantPenalite) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("utilisateurId", emprunt.getUtilisateurId());
        notification.put("type", "CONFIRMATION_RETOUR");
        notification.put("sujet", "Confirmation de retour");

        String message = montantPenalite > 0 ?
                String.format("Retour du livre enregistré.\nRetard: %d jours\nPénalité: %.2f €", joursRetard, montantPenalite) :
                "Retour du livre enregistré. Merci !";

        notification.put("message", message);
        notificationClient.envoyerNotification(notification);
    }

    private void envoyerNotificationPenalite(Emprunt emprunt, int joursRetard, double montantPenalite) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("utilisateurId", emprunt.getUtilisateurId());
        notification.put("type", "PENALITE");
        notification.put("sujet", "Pénalité de retard");
        notification.put("message", String.format(
                "Vous avez rendu le livre avec %d jours de retard.\n" +
                        "Montant de la pénalité: %.2f €\n" +
                        "Veuillez régler cette somme rapidement.",
                joursRetard, montantPenalite
        ));
        notificationClient.envoyerNotification(notification);
    }
    /**
     * ✅ Supprimer un emprunt déjà retourné (nettoyage de l'historique)
     */
    @Transactional
    public void supprimerEmprunt(Long empruntId) {
        Emprunt emprunt = empruntRepository.findById(Math.toIntExact(empruntId))
                .orElseThrow(() -> new EmpruntNotFoundException("Emprunt non trouvé avec l'ID: " + empruntId));

        if (emprunt.getStatut() != Statut.RETOURNE && emprunt.getStatut() != Statut.REFUSE && emprunt.getStatut() != Statut.ANNULE && emprunt.getStatut() != Statut.EN_RETARD) {
            throw new IllegalStateException("Seuls les emprunts déjà retournés ou refuses peuvent être supprimés");
        }

        empruntRepository.delete(emprunt);
    }

}
// UtilisateurService.java
package Bu.Microservice.utilisateur.Service;

import Bu.Microservice.utilisateur.Client.NotificationClient;
import Bu.Microservice.utilisateur.Dto.InscriptionRequestDTO;
import Bu.Microservice.utilisateur.Dto.ModifierUtilisateurDTO;
import Bu.Microservice.utilisateur.Dto.UtilisateurReponseDTO;
import Bu.Microservice.utilisateur.Dto.VerifierEmpruntDTO;
import Bu.Microservice.utilisateur.Model.Role;
import Bu.Microservice.utilisateur.Model.Utilisateur;
import Bu.Microservice.utilisateur.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final NotificationClient notificationClient;
    /**
     * Convertir entité en DTO
     */
    private UtilisateurReponseDTO toResponseDTO(Utilisateur utilisateur) {
        return UtilisateurReponseDTO.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .telephone(utilisateur.getTelephone())
                .adresse(utilisateur.getAdresse())
                .dateInscription(utilisateur.getDateInscription())
                .pretsActifs(utilisateur.getPretsActifs())
                .pretsMax(utilisateur.getPretsMax())
                .penalitesImpayees(utilisateur.getPenalitesImpayees())
                .actif(utilisateur.getActif())
                .roles(utilisateur.getRoles().stream().map(Role::getNom).collect(Collectors.toList()))
                .build();
    }

    /**
     * Inscription d'un nouvel utilisateur (rôle MEMBRE par défaut)
     */
    @Transactional
    public UtilisateurReponseDTO inscription(InscriptionRequestDTO request) {
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setAdresse(request.getAdresse());

        // Assigner le rôle MEMBRE par défaut
        Set<Role> roles = new HashSet<>();
        roles.add(roleService.getOrCreateRole("ROLE_MEMBRE"));
        utilisateur.setRoles(roles);

        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);
        return toResponseDTO(savedUtilisateur);
    }

    /*
      Créer un utilisateur avec un rôle spécifique (admin seulement)
     */
    @Transactional
    public UtilisateurReponseDTO creerUtilisateur(InscriptionRequestDTO request, String roleNom) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setAdresse(request.getAdresse());

        Set<Role> roles = new HashSet<>();
        roles.add(roleService.getOrCreateRole(roleNom));
        utilisateur.setRoles(roles);

        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);
        return toResponseDTO(savedUtilisateur);
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public List<UtilisateurReponseDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public UtilisateurReponseDTO getUtilisateurById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return toResponseDTO(utilisateur);
    }

    /**
     * Récupérer un utilisateur par email
     */
    public UtilisateurReponseDTO getUtilisateurByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return toResponseDTO(utilisateur);
    }

    /**
     * Mettre à jour un utilisateur
     */
    @Transactional
    public UtilisateurReponseDTO mettreAJourUtilisateur(Long id, InscriptionRequestDTO request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setAdresse(request.getAdresse());

        if (request.getMotDePasse() != null && !request.getMotDePasse().isEmpty()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        Utilisateur updatedUtilisateur = utilisateurRepository.save(utilisateur);
        return toResponseDTO(updatedUtilisateur);
    }

    /**
     * Vérifier si l'utilisateur peut emprunter (appelé par Emprunt Service)
     */
    public boolean peutEmprunter(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return utilisateur.getActif() &&
                utilisateur.getPretsActifs() < utilisateur.getPretsMax() &&
                utilisateur.getPenalitesImpayees() <= utilisateur.getSeuilBlocage();
    }
    /**
     * Obtenir le message d'éligibilité
     */
    public String getMessageEligibilite(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!utilisateur.getActif()) {
            return "Compte bloqué";
        }
        if (utilisateur.getPenalitesImpayees() > utilisateur.getSeuilBlocage()) {
            return "Pénalités impayées dépassent le seuil";
        }
        if (utilisateur.getPretsActifs() >= utilisateur.getPretsMax()) {
            return "Nombre maximum de prêts atteint (" + utilisateur.getPretsMax() + ")";
        }
        return "Utilisateur éligible";
    }
    /**
     * Vérifier si l'utilisateur peut emprunter (appelé par Emprunt Service)
     */
    public VerifierEmpruntDTO verifierEligibiliteEmprunt(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return VerifierEmpruntDTO.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .peutEmprunter(peutEmprunter(utilisateur.getId()))
                .penalitesImpayees(utilisateur.getPenalitesImpayees())
                .pretsEnCours(utilisateur.getPretsActifs())
                .maxPretsAutorises(utilisateur.getPretsMax())
                .message(getMessageEligibilite(utilisateur.getId()))
                .build();
    }

    /**
     * Incrémenter les prêts actifs (appelé par Emprunt Service)
     */
    @Transactional
    public void incrementerPretsActifs(Long id) {
        utilisateurRepository.incrementerPretsActifs(id);
    }

    /**
     * Décrémenter les prêts actifs (appelé par Emprunt Service)
     */
    @Transactional
    public void decrementerPretsActifs(Long id) {
        utilisateurRepository.decrementerPretsActifs(id);
    }

    /**
     * Ajouter une pénalité (appelé par Penalty Service)
     */
    @Transactional
    public void ajouterPenalite(Long id, Double montant) {
        utilisateurRepository.ajouterPenalite(id, montant);
    }



    public List<Map<String, Object>> getMesNotifications(Long utilisateurId) {
        try {
            return notificationClient.getMesNotifications(utilisateurId);
        } catch (Exception e) {
            log.error("Erreur récupération notifications: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Payer une pénalité
     */
    @Transactional
    public void payerPenalite(Long id, Double montant) {
        utilisateurRepository.payerPenalite(id, montant);
    }

    /**
     * Bloquer un utilisateur
     */
    @Transactional
    public void bloquerUtilisateur(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateur.setActif(false);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Débloquer un utilisateur
     */
    @Transactional
    public void debloquerUtilisateur(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateur.setActif(true);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Modifier le rôle d'un utilisateur
     */
    @Transactional
    public void modifierRole(Long id, String roleNom) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Set<Role> roles = new HashSet<>();
        roles.add(roleService.getOrCreateRole(roleNom));
        utilisateur.setRoles(roles);

        utilisateurRepository.save(utilisateur);
    }
    /**
     * Modifier nom/prénom/email/mot de passe d'un utilisateur (admin)
     */
    @Transactional
    public UtilisateurReponseDTO modifierUtilisateurAdmin(Long id, ModifierUtilisateurDTO request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier que le nouvel email n'est pas déjà pris par un AUTRE utilisateur
        if (request.getEmail() != null && !request.getEmail().equals(utilisateur.getEmail())) {
            utilisateurRepository.findByEmail(request.getEmail()).ifPresent(existant -> {
                if (!existant.getId().equals(id)) {
                    throw new RuntimeException("Cet email est déjà utilisé par un autre utilisateur");
                }
            });
            utilisateur.setEmail(request.getEmail());
        }

        if (request.getNom() != null && !request.getNom().isBlank()) {
            utilisateur.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            utilisateur.setPrenom(request.getPrenom());
        }
        if (request.getTelephone() != null) {
            utilisateur.setTelephone(request.getTelephone());
        }
        if (request.getAdresse() != null) {
            utilisateur.setAdresse(request.getAdresse());
        }
        // Mot de passe : on ne le change que s'il est explicitement fourni
        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        Utilisateur updatedUtilisateur = utilisateurRepository.save(utilisateur);
        return toResponseDTO(updatedUtilisateur);
    }

}
// LivreService.java
package Bu.micosevice.Livre.Service;


import Bu.micosevice.Livre.Dto.DisponibiliteDTO;
import Bu.micosevice.Livre.Dto.LivreReponseDTO;
import Bu.micosevice.Livre.Dto.LivreRequeteDTO;
import Bu.micosevice.Livre.Exceptions.LivreIndisponibleException;
import Bu.micosevice.Livre.Exceptions.LivreNotFoundException;
import Bu.micosevice.Livre.Model.Livre;
import Bu.micosevice.Livre.Model.Statut;
import Bu.micosevice.Livre.Repository.LivreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LivreService {

    private final LivreRepository livreRepository;

    /**
     * Convertir une entité en DTO
     */

    private LivreReponseDTO toResponseDTO(Livre livre) {
        return new LivreReponseDTO(
                livre.getId(),
                livre.getTitre(),
                livre.getAuteur(),
                livre.getIsbn(),
                livre.getEditeur(),
                livre.getAnneePublication(),
                livre.getCategorie(),
                livre.getDescription(),
                livre.getNombreExemplaires(),
                livre.getNombreDisponibles(),
                livre.getStatut(),
                livre.getDateCreation()
        );
    }

    /**
     * Récupérer tous les livres
     */
    public List<LivreReponseDTO> getAllLivres() {
        return (List<LivreReponseDTO>) livreRepository.findAll().stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());

    }

    /**
     * Récupérer un livre par son ID (avec cache)
     */
    @Cacheable(value = "livres", key = "#id")
    public LivreReponseDTO getLivreById(Long id) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));
        return toResponseDTO(livre);
    }

    /**
     * Récupérer un livre par son ISBN
     */
    public LivreReponseDTO getLivreByIsbn(String isbn) throws Throwable {
        Livre livre = (Livre) livreRepository.findByIsbn(isbn)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ISBN: " + isbn));
        return toResponseDTO(livre);
    }

    /**
     * Rechercher des livres par titre
     */
    public List<LivreReponseDTO> rechercherParTitre(String titre) {
        return (List<LivreReponseDTO>) livreRepository.findByTitreContainingIgnoreCase(titre).stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Rechercher des livres par auteur
     */
    public List<LivreReponseDTO> rechercherParAuteur(String auteur) {
        return (List<LivreReponseDTO>) livreRepository.findByAuteurContainingIgnoreCase(auteur).stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Rechercher des livres par catégorie
     */
    public List<LivreReponseDTO> rechercherParCategorie(String categorie) {
        return (List<LivreReponseDTO>) livreRepository.findByCategorie(categorie).stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Rechercher par mot clé (titre, auteur, ISBN)
     */
    public List<LivreReponseDTO> rechercherParMotCle(String motCle) {
        return (List<LivreReponseDTO>) livreRepository.rechercherParMotCle(motCle).stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Récupérer tous les livres disponibles
     */
    public List<LivreReponseDTO> getLivresDisponibles() {
        return (List<LivreReponseDTO>) livreRepository.findLivresDisponibles().stream()
                .map(livre -> toResponseDTO((Livre) livre))  // ← Au lieu de this::toResponseDTO
                .collect(Collectors.toList());
    }

    /**
     * Vérifier la disponibilité d'un livre
     */
    public DisponibiliteDTO verifierDisponibilite(Long id) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));

        boolean disponible = livre.isDisponible();
        return new DisponibiliteDTO(
                livre.getId(),
                livre.getTitre(),
                livre.getAuteur(),
                disponible,
                disponible ? "Livre disponible" : "Livre indisponible",
                livre.getNombreDisponibles()
        );
    }

    /**
     * Créer un nouveau livre
     */
    @Transactional
    public LivreReponseDTO creerLivre(LivreRequeteDTO requete) {
        // Vérifier si l'ISBN existe déjà
        if (requete.getIsbn() != null && !requete.getIsbn().isEmpty()) {
            livreRepository.findByIsbn(requete.getIsbn()).ifPresent(l -> {
                throw new RuntimeException("Un livre avec cet ISBN existe déjà");
            });
        }

        Livre livre = new Livre();
        livre.setTitre(requete.getTitre());
        livre.setAuteur(requete.getAuteur());
        livre.setIsbn(requete.getIsbn());
        livre.setEditeur(requete.getEditeur());
        livre.setAnneePublication(requete.getAnneePublication());
        livre.setCategorie(requete.getCategorie());
        livre.setDescription(requete.getDescription());
        livre.setNombreExemplaires(requete.getNombreExemplaires());
        livre.setNombreDisponibles(requete.getNombreExemplaires());
        livre.setStatut(Statut.valueOf("DISPONIBLE"));

        Livre savedLivre = (Livre) livreRepository.save(livre);
        return toResponseDTO(savedLivre);
    }

    /**
     * Mettre à jour un livre
     */
    @Transactional
    @CacheEvict(value = "livres", key = "#id")
    public LivreReponseDTO mettreAJourLivre(Long id, LivreRequeteDTO requete) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));

        livre.setTitre(requete.getTitre());
        livre.setAuteur(requete.getAuteur());
        livre.setIsbn(requete.getIsbn());
        livre.setEditeur(requete.getEditeur());
        livre.setAnneePublication(requete.getAnneePublication());
        livre.setCategorie(requete.getCategorie());
        livre.setDescription(requete.getDescription());

        Livre updatedLivre = (Livre) livreRepository.save(livre);
        return toResponseDTO(updatedLivre);
    }

    /**
     * Mettre à jour le nombre d'exemplaires
     */
    @Transactional
    @CacheEvict(value = "livres", key = "#id")
    public LivreReponseDTO mettreAJourExemplaires(Long id, Integer nouveauNombre) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));

        int difference = nouveauNombre - livre.getNombreExemplaires();
        int nouveauxDisponibles = livre.getNombreDisponibles() + difference;

        if (nouveauxDisponibles < 0) {
            throw new RuntimeException("Impossible de réduire le nombre d'exemplaires car certains sont empruntés");
        }

        livre.setNombreExemplaires(nouveauNombre);
        livre.setNombreDisponibles(nouveauxDisponibles);
        if (nouveauxDisponibles > 0) {
            livre.setStatut(Statut.valueOf("DISPONIBLE"));
        }

        Livre updatedLivre = (Livre) livreRepository.save(livre);
        return toResponseDTO(updatedLivre);
    }

    /**
     * Emprunter un livre (appelé par Emprunt Service)
     */
    @Transactional
    public DisponibiliteDTO emprunterLivre(Long id) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));

        if (!livre.isDisponible()) {
            throw new LivreIndisponibleException("Le livre '" + livre.getTitre() + "' n'est pas disponible");
        }

        livre.emprunter();
        livreRepository.save(livre);

        return new DisponibiliteDTO(
                livre.getId(),
                livre.getTitre(),
                livre.getAuteur(),
                false,
                "Livre emprunté avec succès",
                livre.getNombreDisponibles()
        );
    }

    /**
     * Retourner un livre (appelé par Emprunt Service)
     */
    @Transactional
    public DisponibiliteDTO retournerLivre(Long id) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));

        livre.retourner();
        livreRepository.save(livre);

        return new DisponibiliteDTO(
                livre.getId(),
                livre.getTitre(),
                livre.getAuteur(),
                true,
                "Livre retourné avec succès",
                livre.getNombreDisponibles()
        );
    }

    /**
     * Supprimer un livre (soft delete)
     */
    @Transactional
    @CacheEvict(value = "livres", key = "#id")
    public void supprimerLivre(Long id) throws Throwable {
        Livre livre = (Livre) livreRepository.findById(id)
                .orElseThrow(() -> new LivreNotFoundException("Livre non trouvé avec l'ID: " + id));
        livre.setStatut(Statut.valueOf("SUPPRIME"));
        livreRepository.save(livre);
    }

    /**
     * Supprimer définitivement un livre
     */
    @Transactional
    @CacheEvict(value = "livres", key = "#id")
    public void supprimerLivreDefinitivement(Long id) {
        if (!livreRepository.existsById(id)) {
            throw new LivreNotFoundException("Livre non trouvé avec l'ID: " + id);
        }
        livreRepository.deleteById(id);
    }

    /**
     * Obtenir les statistiques
     */
    public long countLivresDisponibles() {
        return livreRepository.countLivresDisponibles();
    }

    /**
     * Obtenir le nombre total de livres
     */
    public long countTotalLivres() {
        return livreRepository.count();
    }
}
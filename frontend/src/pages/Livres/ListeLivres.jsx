import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { livreApi } from '../../api/livreApi';
import { empruntApi } from '../../api/empruntApi';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaHandshake, FaClock, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const ListeLivres = () => {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('titre');
  const [selectedLivre, setSelectedLivre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRetour, setDateRetour] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin, isBibliothecaire, user } = useAuth();
  const navigate = useNavigate();

  // ✅ Admin ET bibliothécaire peuvent gérer le catalogue
  const peutGerer = isAdmin() || isBibliothecaire();
  const estMembre = !isAdmin() && !isBibliothecaire();

  useEffect(() => {
    fetchLivres();
  }, []);

  const fetchLivres = async () => {
    setLoading(true);
    try {
      const response = await livreApi.getAll();
      setLivres(response.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLivres();
      return;
    }
    try {
      const params = { [searchType]: searchTerm };
      const response = await livreApi.rechercher(params);
      setLivres(response.data || []);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      try {
        await livreApi.delete(id);
        toast.success('Livre supprimé avec succès');
        fetchLivres();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // ✅ Ouvrir le modal avec les détails du livre
  const openDetailsModal = (livre) => {
    setSelectedLivre(livre);
    setShowModal(true);
    // Initialiser la date de retour (J+1)
    const date = new Date();
    date.setDate(date.getDate() + 1);
    setDateRetour(date.toISOString().split('T')[0]);
  };

  // ✅ Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedLivre(null);
    setDateRetour('');
    setSubmitting(false);
  };

  // ✅ Demander un emprunt
  const handleEmprunter = async () => {
    if (!selectedLivre) return;
    
    if (!dateRetour) {
      toast.warning('Veuillez choisir une date de retour');
      return;
    }

    setSubmitting(true);
    try {
      console.log('📤 Demande d\'emprunt:', {
        livreId: selectedLivre.id,
        dateRetourPrevue: dateRetour
      });

      const response = await empruntApi.demanderEmprunt(selectedLivre.id, dateRetour);
      console.log('✅ Réponse:', response.data);
      
      toast.success(`✅ Demande d'emprunt pour "${selectedLivre.titre}" envoyée !`);
      closeModal();
      fetchLivres(); // Rafraîchir la liste
    } catch (error) {
  console.error('❌ Erreur emprunt:', error);

  // ✅ Affiche toujours le vrai message du backend s'il existe
  const messageBackend = error.response?.data?.error || error.response?.data?.message;

  if (messageBackend) {
    toast.error(messageBackend);
  } else if (error.response?.status === 404) {
    toast.error("Service d'emprunt non disponible. Veuillez réessayer plus tard.");
  } else if (error.response?.status === 401) {
    toast.error('Vous devez être connecté pour emprunter');
  } else {
    toast.error("Impossible de faire la demande d'emprunt");
  }
}
  };

  // ✅ Calculer la date minimum (J+1)
  const getDateMin = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // ✅ Calculer la date maximum (J+14)
  const getDateMax = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="text-muted mt-2">Chargement des livres...</p>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold mb-0">📚 Liste des livres</h2>
        {peutGerer && (
          <Link to="/livres/ajouter" className="btn btn-primary">
            <FaPlus className="me-2" /> Ajouter un livre
          </Link>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="d-flex gap-2 flex-wrap">
          <div className="d-flex gap-2" style={{ maxWidth: 480, flex: 1 }}>
            <select
              className="form-select"
              style={{ maxWidth: 140 }}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="titre">Titre</option>
              <option value="auteur">Auteur</option>
              <option value="categorie">Catégorie</option>
              <option value="motCle">Mot clé</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary flex-shrink-0" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
          <button className="btn btn-outline-secondary" onClick={fetchLivres}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Catégorie</th>
                  <th className="text-center">Exemplaires</th>
                  <th className="text-center">Disponibles</th>
                  <th className="text-center">Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {livres.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <p className="text-muted mb-0">Aucun livre trouvé</p>
                    </td>
                  </tr>
                ) : (
                  livres.map((livre) => {
                    const disponible = (livre.nombreDisponibles || 0) > 0;
                    return (
                      <tr key={livre.id}>
                        <td className="fw-medium">{livre.titre}</td>
                        <td>{livre.auteur}</td>
                        <td>
                          <span className="badge bg-info-subtle text-info-emphasis">
                            {livre.categorie || 'Non catégorisé'}
                          </span>
                        </td>
                        <td className="text-center">{livre.nombreExemplaires || 1}</td>
                        <td className="text-center">
                          <span className="fw-bold">{livre.nombreDisponibles || 0}</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${disponible ? 'bg-success' : 'bg-danger'}`}>
                            {disponible ? '✅ Disponible' : '❌ Indisponible'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1 flex-wrap">
                            {/* ✅ Bouton Voir détails */}
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => openDetailsModal(livre)}
                              title="Voir les détails"
                            >
                              <FaEye />
                            </button>

                            {/* ✅ Bouton Emprunter (pour les membres) */}
                            {estMembre && disponible && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => openDetailsModal(livre)}
                                title="Emprunter ce livre"
                              >
                                <FaHandshake />
                              </button>
                            )}

                            {/* ✅ Actions Admin / Bibliothécaire */}
                            {peutGerer && (
                              <>
                                <Link 
                                  to={`/livres/edit/${livre.id}`} 
                                  className="btn btn-sm btn-warning"
                                  title="Modifier"
                                >
                                  <FaEdit />
                                </Link>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(livre.id)}
                                  title="Supprimer"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ MODAL : Détails et emprunt */}
      {showModal && selectedLivre && (
        <>
          <div className="modal-backdrop fade show" onClick={closeModal} />
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <FaEye className="me-2" />
                    Détails du livre
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  {/* Informations du livre */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5 className="fw-bold">{selectedLivre.titre}</h5>
                      <p className="text-muted mb-1">
                        <strong>Auteur :</strong> {selectedLivre.auteur}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Catégorie :</strong> {selectedLivre.categorie || 'Non catégorisé'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>ISBN :</strong> {selectedLivre.isbn || 'Non renseigné'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Éditeur :</strong> {selectedLivre.editeur || 'Non renseigné'}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Année :</strong> {selectedLivre.annee || 'Non renseignée'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-1">
                        <strong>Exemplaires :</strong> {selectedLivre.nombreExemplaires || 1}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Disponibles :</strong> 
                        <span className="fw-bold text-success ms-1">
                          {selectedLivre.nombreDisponibles || 0}
                        </span>
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Statut :</strong>
                        <span className={`badge ms-2 ${(selectedLivre.nombreDisponibles || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {(selectedLivre.nombreDisponibles || 0) > 0 ? 'Disponible' : 'Indisponible'}
                        </span>
                      </p>
                      {selectedLivre.description && (
                        <div className="mt-3">
                          <strong>Description :</strong>
                          <p className="text-muted mt-1">{selectedLivre.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formulaire d'emprunt */}
                  {estMembre && (selectedLivre.nombreDisponibles || 0) > 0 && (
                    <div className="border-top pt-3">
                      <h6 className="fw-bold text-success">
                        <FaHandshake className="me-2" />
                        Demander un emprunt
                      </h6>
                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label className="form-label fw-bold small">
                            Date de retour prévue
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={dateRetour}
                            onChange={(e) => setDateRetour(e.target.value)}
                            min={getDateMin()}
                            max={getDateMax()}
                            required
                          />
                          <small className="text-muted">
                            📅 Durée maximale : 14 jours
                          </small>
                        </div>
                        <div className="col-md-6">
                          <button
                            className="btn btn-success w-100"
                            onClick={handleEmprunter}
                            disabled={submitting || !dateRetour}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                <FaHandshake className="me-2" />
                                Demander l'emprunt
                              </>
                            )}
                          </button>
                          <small className="text-muted d-block text-center mt-1">
                            ⏳ En attente de validation par le bibliothécaire
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {estMembre && (selectedLivre.nombreDisponibles || 0) === 0 && (
                    <div className="border-top pt-3 text-center text-warning">
                      <FaClock className="me-2" />
                      <strong>Ce livre n'est pas disponible actuellement.</strong>
                    </div>
                  )}

                  {!estMembre && peutGerer && (
                    <div className="border-top pt-3 text-center text-muted">
                      <small>🔒 Vous êtes bibliothécaire ou admin. Utilisez la page d'emprunt pour gérer les prêts.</small>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                  >
                    <FaTimes className="me-1" /> Fermer
                  </button>
                  {estMembre && (selectedLivre.nombreDisponibles || 0) > 0 && (
                    <button
                      className="btn btn-success"
                      onClick={handleEmprunter}
                      disabled={submitting || !dateRetour}
                    >
                      {submitting ? 'Envoi...' : <><FaHandshake className="me-1" /> Demander l'emprunt</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListeLivres;
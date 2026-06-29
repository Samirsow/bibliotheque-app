import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaUserSlash, FaUserCheck, FaTrash, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';

// ✅ Constantes pour les rôles
const ROLES = {
  MEMBRE: 'ROLE_MEMBRE',
  ADMIN: 'ROLE_ADMIN',
  BIBLIOTHECAIRE: 'ROLE_BIBLIOTHECAIRE'
};

const Membres = () => {
  const [membres, setMembres] = useState([]);
  const [filteredMembres, setFilteredMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  useEffect(() => {
    filtrerMembres();
  }, [searchTerm, membres, showAll]);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await bibliothecaireApi.getMembres();
      console.log('📦 Données reçues de l\'API:', res.data);
      
      // ✅ Filtrage STRICT : UNIQUEMENT les membres avec ROLE_MEMBRE
      const membresSimples = res.data.filter((m) => {
        const roles = m.roles || [];
        // Vérifier que l'utilisateur a le rôle MEMBRE
        const estMembre = roles.includes(ROLES.MEMBRE);
        // Vérifier qu'il n'a PAS les rôles exclus
        const estExclu = roles.some(r => 
          r === ROLES.ADMIN || 
          r === ROLES.BIBLIOTHECAIRE
        );
        return estMembre && !estExclu;
      });
      
      console.log('✅ Membres filtrés (simples):', membresSimples);
      setMembres(membresSimples);
      setFilteredMembres(membresSimples);
      
      // Afficher un avertissement si des utilisateurs indésirables sont trouvés
      const indesirables = res.data.filter(m => 
        !m.roles?.includes(ROLES.MEMBRE) || 
        m.roles?.some(r => r === ROLES.ADMIN || r === ROLES.BIBLIOTHECAIRE)
      );
      if (indesirables.length > 0) {
        console.warn('⚠️ Utilisateurs exclus:', indesirables);
      }
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  const filtrerMembres = () => {
    let result = [...membres];
    
    // Appliquer la recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(m => 
        m.nom?.toLowerCase().includes(term) ||
        m.prenom?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        `${m.prenom} ${m.nom}`.toLowerCase().includes(term)
      );
    }
    
    setFilteredMembres(result);
  };

  // ✅ Vérification de sécurité pour un membre
  const estMembreSimple = (membre) => {
    const roles = membre.roles || [];
    return roles.includes(ROLES.MEMBRE) && 
           !roles.includes(ROLES.ADMIN) && 
           !roles.includes(ROLES.BIBLIOTHECAIRE);
  };

  const handleBloquer = async (id) => {
    if (!window.confirm('Confirmer le blocage de ce membre ?')) return;
    setActionId(id);
    try {
      await bibliothecaireApi.bloquerMembre(id);
      toast.success('Membre bloqué avec succès');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible');
    } finally {
      setActionId(null);
    }
  };

  const handleDebloquer = async (id) => {
    setActionId(id);
    try {
      await bibliothecaireApi.debloquerMembre(id);
      toast.success('Membre débloqué avec succès');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible');
    } finally {
      setActionId(null);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('⚠️ Confirmer la suppression définitive de ce membre ?')) return;
    setActionId(id);
    try {
      await bibliothecaireApi.supprimerMembre(id);
      toast.success('Membre supprimé avec succès');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible');
    } finally {
      setActionId(null);
    }
  };

  // ✅ Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (roles) => {
    if (!roles) return 'Inconnu';
    if (roles.includes(ROLES.ADMIN)) return 'Administrateur';
    if (roles.includes(ROLES.BIBLIOTHECAIRE)) return 'Bibliothécaire';
    if (roles.includes(ROLES.MEMBRE)) return 'Membre';
    return 'Inconnu';
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold mb-0">Gestion des Membres</h2>
          <p className="text-muted small mb-0">
            {filteredMembres.length} membre{filteredMembres.length > 1 ? 's' : ''} trouvé{filteredMembres.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} d-flex align-items-center gap-2`}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? 'Annuler' : 'Nouveau membre'}
        </button>
      </div>

      {showForm && (
        <NouveauMembreForm
          onCreated={() => {
            setShowForm(false);
            charger();
          }}
        />
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <button 
                className="btn btn-outline-secondary btn-sm me-2"
                onClick={charger}
              >
                🔄 Actualiser
              </button>
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => setShowAll(!showAll)}
                title={showAll ? "Masquer les administrateurs" : "Afficher tous les utilisateurs"}
              >
                {showAll ? <FaEyeSlash /> : <FaEye />}
                {showAll ? ' Masquer admin' : ' Voir tout'}
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-muted mt-2">Chargement des membres...</p>
            </div>
          ) : filteredMembres.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">
                {searchTerm ? 'Aucun membre ne correspond à votre recherche.' : 'Aucun membre trouvé.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Prêts</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembres.map((m) => {
                    // ✅ Vérification de sécurité : on n'affiche que les membres simples
                    const estMembre = estMembreSimple(m);
                    
                    // Si showAll est false, on masque les non-membres
                    if (!showAll && !estMembre) return null;
                    
                    return (
                      <tr key={m.id} className={!estMembre ? 'table-warning' : ''}>
                        <td className="fw-medium">{m.prenom} {m.nom}</td>
                        <td>{m.email}</td>
                        <td>
                          <span className={`badge ${
                            m.roles?.includes(ROLES.ADMIN) ? 'bg-danger' :
                            m.roles?.includes(ROLES.BIBLIOTHECAIRE) ? 'bg-warning text-dark' :
                            'bg-primary'
                          }`}>
                            {getRoleLabel(m.roles)}
                          </span>
                          {!estMembre && (
                            <span className="badge bg-secondary ms-1">⚠️ Non autorisé</span>
                          )}
                        </td>
                        <td>
                          {m.actif ? (
                            <span className="badge bg-success-subtle text-success-emphasis">Actif</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger-emphasis">Bloqué</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info-subtle text-info-emphasis">
                            {m.pretsActifs || 0}/{m.pretsMax || 5}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            {estMembre ? (
                              // ✅ Actions pour les membres simples
                              <>
                                {m.actif ? (
                                  <button
                                    onClick={() => handleBloquer(m.id)}
                                    disabled={actionId === m.id}
                                    className="btn btn-sm btn-outline-warning"
                                    title="Bloquer"
                                  >
                                    {actionId === m.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      <FaUserSlash />
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDebloquer(m.id)}
                                    disabled={actionId === m.id}
                                    className="btn btn-sm btn-outline-success"
                                    title="Débloquer"
                                  >
                                    {actionId === m.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      <FaUserCheck />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSupprimer(m.id)}
                                  disabled={actionId === m.id}
                                  className="btn btn-sm btn-outline-danger"
                                  title="Supprimer"
                                >
                                  {actionId === m.id ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                </button>
                              </>
                            ) : (
                              // ✅ Message pour les utilisateurs non autorisés
                              <span className="text-muted small">
                                <FaEye /> Lecture seule
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Composant pour créer un nouveau membre
const NouveauMembreForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation
    if (form.motDePasse.length < 6) {
      toast.warning('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Rôle fixé à ROLE_MEMBRE
      await bibliothecaireApi.creerMembre(form, ROLES.MEMBRE);
      toast.success('✅ Membre créé avec succès');
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '' });
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Création impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mb-4 shadow-sm border-primary">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <FaPlus className="text-primary me-2" />
          Créer un nouveau membre
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Nom *</label>
              <input
                name="nom"
                placeholder="Dupont"
                value={form.nom}
                onChange={handleChange}
                required
                className="form-control"
                disabled={submitting}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Prénom *</label>
              <input
                name="prenom"
                placeholder="Jean"
                value={form.prenom}
                onChange={handleChange}
                required
                className="form-control"
                disabled={submitting}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="jean.dupont@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control"
                disabled={submitting}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Téléphone</label>
              <input
                name="telephone"
                placeholder="06 12 34 56 78"
                value={form.telephone}
                onChange={handleChange}
                className="form-control"
                disabled={submitting}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Mot de passe *</label>
              <input
                type="password"
                name="motDePasse"
                placeholder="Minimum 6 caractères"
                value={form.motDePasse}
                onChange={handleChange}
                required
                className="form-control"
                disabled={submitting}
                minLength="6"
              />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-100"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Création en cours...
                  </>
                ) : (
                  'Créer le membre'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Membres;
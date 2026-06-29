import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { toast } from 'react-toastify';
import BoutonRetour from '../../components/Layout/BoutonRetour';
import {
  FaUserShield,
  FaUserSlash,
  FaUserCheck,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSearch,
  FaEdit,
} from 'react-icons/fa';

const ROLES_DISPONIBLES = ['ROLE_MEMBRE', 'ROLE_BIBLIOTHECAIRE', 'ROLE_ADMIN'];

// ✅ Composant de formulaire SIMPLIFIÉ
const CreerUtilisateurForm = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
  });
  const [role, setRole] = useState('ROLE_MEMBRE');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.motDePasse.length < 6) {
      toast.warning('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setSubmitting(true);
    try {
      await adminApi.creerUtilisateur(form, role);
      toast.success('Utilisateur créé avec succès');
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '' });
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Création impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4 mb-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <h5 className="card-title mb-3">Nouvel utilisateur</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              name="nom"
              placeholder="Nom *"
              value={form.nom}
              onChange={handleChange}
              required
              className="form-control"
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <input
              name="prenom"
              placeholder="Prénom *"
              value={form.prenom}
              onChange={handleChange}
              required
              className="form-control"
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              className="form-control"
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <input
              type="password"
              name="motDePasse"
              placeholder="Mot de passe *"
              value={form.motDePasse}
              onChange={handleChange}
              required
              className="form-control"
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <input
              name="telephone"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={handleChange}
              className="form-control"
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
              disabled={submitting}
            >
              {ROLES_DISPONIBLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('ROLE_', '')}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 d-flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ✅ Composant principal SIMPLIFIÉ
const AdminUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUtilisateurs();
      setUtilisateurs(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Impossible de charger les utilisateurs');
      setUtilisateurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBloquer = async (id) => {
    setActionLoadingId(id);
    try {
      await adminApi.bloquerUtilisateur(id);
      toast.success('Utilisateur bloqué');
      await chargerUtilisateurs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action impossible');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDebloquer = async (id) => {
    setActionLoadingId(id);
    try {
      await adminApi.debloquerUtilisateur(id);
      toast.success('Utilisateur débloqué');
      await chargerUtilisateurs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action impossible');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    setActionLoadingId(id);
    try {
      await adminApi.supprimerUtilisateur(id);
      toast.success('Utilisateur supprimé');
      await chargerUtilisateurs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action impossible');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangerRole = async (id, nouveauRole) => {
    setActionLoadingId(id);
    try {
      await adminApi.modifierRole(id, nouveauRole);
      toast.success('Rôle modifié');
      await chargerUtilisateurs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action impossible');
    } finally {
      setActionLoadingId(null);
    }
  };

  const utilisateursFiltres = utilisateurs.filter((u) => {
    const terme = recherche.toLowerCase().trim();
    if (!terme) return true;
    return (
      (u.nom || '').toLowerCase().includes(terme) ||
      (u.prenom || '').toLowerCase().includes(terme) ||
      (u.email || '').toLowerCase().includes(terme)
    );
  });

  // ✅ Rendu SIMPLIFIÉ avec des fragments
  return (
    <div className="container py-4">
      <BoutonRetour to="/dashboard" label="Retour" />

      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold">
          <FaUserShield className="text-primary me-2" />
          Gestion des utilisateurs
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`btn ${showCreateForm ? 'btn-outline-secondary' : 'btn-primary'}`}
        >
          {showCreateForm ? <FaTimes className="me-1" /> : <FaPlus className="me-1" />}
          {showCreateForm ? 'Fermer' : 'Nouvel utilisateur'}
        </button>
      </div>

      {/* Formulaire */}
      {showCreateForm && (
        <CreerUtilisateurForm
          onCreated={() => {
            setShowCreateForm(false);
            chargerUtilisateurs();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Recherche */}
      <div className="input-group mb-3" style={{ maxWidth: '360px' }}>
        <span className="input-group-text">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {/* Tableau */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Chargement...</p>
            </div>
          ) : utilisateursFiltres.length === 0 ? (
            <p className="text-center text-muted py-5">Aucun utilisateur trouvé</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Prêts</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateursFiltres.map((user) => (
                    <tr key={user.id}>
                      <td>{user.prenom} {user.nom}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.roles?.[0] || 'ROLE_MEMBRE'}
                          onChange={(e) => handleChangerRole(user.id, e.target.value)}
                          disabled={actionLoadingId === user.id}
                          className="form-select form-select-sm"
                          style={{ width: '130px' }}
                        >
                          {ROLES_DISPONIBLES.map((r) => (
                            <option key={r} value={r}>
                              {r.replace('ROLE_', '')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${user.actif ? 'bg-success' : 'bg-danger'}`}>
                          {user.actif ? 'Actif' : 'Bloqué'}
                        </span>
                      </td>
                      <td>{user.pretsActifs || 0}/{user.pretsMax || 5}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            disabled={actionLoadingId === user.id}
                          >
                            <FaEdit />
                          </button>
                          {user.actif ? (
                            <button
                              onClick={() => handleBloquer(user.id)}
                              disabled={actionLoadingId === user.id}
                              className="btn btn-sm btn-outline-warning"
                            >
                              <FaUserSlash />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDebloquer(user.id)}
                              disabled={actionLoadingId === user.id}
                              className="btn btn-sm btn-outline-success"
                            >
                              <FaUserCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleSupprimer(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUtilisateurs;
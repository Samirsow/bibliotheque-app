// src/Pages/Emprunts/MesEmprunts.jsx
import React, { useState, useEffect } from 'react';
import { membreApi } from '../../api/membreApi';
import { toast } from 'react-toastify';
import { FaClock, FaCheckCircle, FaHourglass, FaTimesCircle, FaTrash } from 'react-icons/fa';

const MesEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    chargerEmprunts();
  }, []);

  const chargerEmprunts = async () => {
    setLoading(true);
    try {
      const res = await membreApi.getMesEmprunts();
      setEmprunts(res.data);
    } catch (error) {
      toast.error('Impossible de charger vos emprunts');
      console.error('Erreur chargement emprunts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (empruntId) => {
    if (!window.confirm('Supprimer définitivement cet emprunt de votre historique ?')) return;
    setActionId(empruntId);
    try {
      await membreApi.supprimerEmprunt(empruntId);
      toast.success('✅ Emprunt supprimé de votre historique');
      chargerEmprunts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Suppression impossible');
      console.error('Erreur suppression:', error);
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (statut) => {
    const statusMap = {
      'EN_ATTENTE': { label: 'En attente', color: 'warning', icon: <FaClock /> },
      'EN_COURS': { label: 'En cours', color: 'success', icon: <FaCheckCircle /> },
      'RETOURNE': { label: 'Retourné', color: 'secondary', icon: <FaCheckCircle /> },
      'EN_RETARD': { label: '⚠ En retard', color: 'danger', icon: <FaClock /> },
      'REFUSE': { label: 'Refusé', color: 'danger', icon: <FaTimesCircle /> },
      'ANNULE': { label: 'Annulé', color: 'dark', icon: <FaTimesCircle /> },
    };
    const info = statusMap[statut] || { label: statut, color: 'secondary', icon: <FaHourglass /> };
    return (
      <span className={`badge bg-${info.color}`}>
        {info.icon} {info.label}
      </span>
    );
  };

  // ✅ Peut supprimer : RETOURNE, REFUSE, ANNULE, EN_RETARD
  const peutSupprimer = (statut) => {
    return statut === 'RETOURNE' || 
           statut === 'REFUSE' || 
           statut === 'ANNULE' || 
           statut === 'EN_RETARD';
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Chargement de vos emprunts...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="h4 fw-bold mb-4">📚 Mes Emprunts</h2>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {emprunts.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">
              Vous n'avez pas d'emprunts
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Livre</th>
                    <th>Auteur</th>
                    <th>Date emprunt</th>
                    <th>Retour prévu</th>
                    <th>Statut</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {emprunts.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className="fw-medium">
                          {e.livreTitre || 'Titre non disponible'}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{e.livreAuteur || '-'}</small>
                      </td>
                      <td>
                        {e.dateEmprunt &&
                          new Date(e.dateEmprunt).toLocaleDateString()}
                      </td>
                      <td>
                        {e.dateRetourPrevue &&
                          new Date(e.dateRetourPrevue).toLocaleDateString()}
                        {e.statut === 'EN_RETARD' && (
                          <span className="badge bg-danger ms-2">
                            {e.joursRetard || '?'}j de retard
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(e.statut)}</td>
                      <td className="text-end">
                        {peutSupprimer(e.statut) ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleSupprimer(e.id)}
                            disabled={actionId === e.id}
                            title="Supprimer de l'historique"
                          >
                            <FaTrash className="me-1" />
                            {actionId === e.id ? 'Suppression…' : 'Supprimer'}
                          </button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4">
        <div className="d-flex flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success">●</span>
            <small>En cours</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger">●</span>
            <small>En retard / Refusé</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary">●</span>
            <small>Retourné</small>
          </div>
          <div className="d-flex align-items-center gap-2 text-muted">
            <FaTrash className="text-danger" />
            <small>Supprimable (Retourné, Refusé, Annulé, En retard)</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesEmprunts;
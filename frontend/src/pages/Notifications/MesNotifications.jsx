// src/Pages/Notifications/MesNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../api/notificationApi';
import { FaBell, FaTrash, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MesNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getByUtilisateur(user.id);
      setNotifications(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    try {
      await notificationApi.supprimer(id);
      toast.success('Notification supprimée');
      fetchNotifications();
      // Mettre à jour le compteur dans le composant parent
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return;
    try {
      await notificationApi.supprimerAllByUtilisateur(user.id);
      toast.success('Toutes les notifications supprimées');
      fetchNotifications();
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // ✅ Fonction pour obtenir le badge de statut
  const getStatusBadge = (statut, type) => {
    // Pour les notifications de retour, "EN_ATTENTE" devient "Confirmé"
    if (type === 'CONFIRMATION_RETOUR' && statut === 'EN_ATTENTE') {
      return {
        label: '✅ Confirmé',
        className: 'bg-success',
        icon: <FaCheckCircle className="me-1" />
      };
    }

    const statusMap = {
      'ENVOYEE': { label: '📨 Envoyée', className: 'bg-success', icon: <FaCheckCircle className="me-1" /> },
      'ECHEC': { label: '❌ Échec', className: 'bg-danger', icon: <FaTimesCircle className="me-1" /> },
      'EN_ATTENTE': { label: '⏳ En attente', className: 'bg-warning text-dark', icon: <FaClock className="me-1" /> },
    };

    return statusMap[statut] || { label: statut || 'Inconnu', className: 'bg-secondary', icon: null };
  };

  // ✅ Fonction pour obtenir l'icône du type de notification
  const getTypeIcon = (type) => {
    const typeMap = {
      'CONFIRMATION_RETOUR': '🔄',
      'CONFIRMATION_EMPRUNT': '📚',
      'VALIDATION_EMPRUNT': '✅',
      'DEMANDE_EMPRUNT': '📝',
      'REFUS_EMPRUNT': '❌',
      'PENALITE': '💰',
      'RAPPEL_RETARD': '⏰',
    };
    return typeMap[type] || '📬';
  };

  // ✅ Fonction pour formater le type affiché
  const getTypeLabel = (type) => {
    const typeMap = {
      'CONFIRMATION_RETOUR': 'Confirmation retour',
      'CONFIRMATION_EMPRUNT': 'Confirmation emprunt',
      'VALIDATION_EMPRUNT': 'Validation emprunt',
      'DEMANDE_EMPRUNT': 'Demande emprunt',
      'REFUS_EMPRUNT': 'Refus emprunt',
      'PENALITE': 'Pénalité',
      'RAPPEL_RETARD': 'Rappel retard',
    };
    return typeMap[type] || type;
  };

  // Compter les notifications non lues
  const unreadCount = notifications.filter(
    notif => notif.statut === 'EN_ATTENTE' || !notif.lu
  ).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Chargement des notifications...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📬 Mes notifications</h2>
          <p className="text-muted mb-0">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-outline-danger" onClick={handleDeleteAll}>
            <FaTrash className="me-2" /> Tout supprimer
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-muted py-5">
          <FaBell size={48} className="mb-3 text-secondary" />
          <h5>Aucune notification</h5>
          <p className="text-muted">Vous n'avez pas encore de notifications.</p>
        </div>
      ) : (
        <div className="list-group shadow-sm">
          {notifications.map((notif) => {
            const statusInfo = getStatusBadge(notif.statut, notif.type);
            const typeIcon = getTypeIcon(notif.type);
            const typeLabel = getTypeLabel(notif.type);
            const isUnread = notif.statut === 'EN_ATTENTE' || !notif.lu;
            
            return (
              <div
                key={notif.id}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
                  isUnread ? 'border-start border-4 border-primary' : ''
                }`}
              >
                <div className="ms-2 me-auto w-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold fs-6">
                        {typeIcon} {typeLabel}
                        {isUnread && (
                          <span className="badge bg-primary ms-2">Nouveau</span>
                        )}
                      </div>
                      <p className="mb-1 text-muted">{notif.contenu}</p>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleDelete(notif.id)}
                      title="Supprimer"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                      📅 {new Date(notif.dateCreation).toLocaleString()}
                    </small>
                    <span className={`badge ${statusInfo.className}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Légende */}
      <div className="mt-4 p-3 bg-light rounded">
        <div className="d-flex flex-wrap gap-3">
          <span className="badge bg-success">✅ Confirmé</span>
          <span className="badge bg-warning text-dark">⏳ En attente</span>
          <span className="badge bg-danger">❌ Échec</span>
          <span className="badge bg-secondary">📨 Envoyée</span>
          <span className="badge bg-primary">🔵 Nouveau</span>
        </div>
       
      </div>
    </div>
  );
};

export default MesNotifications;
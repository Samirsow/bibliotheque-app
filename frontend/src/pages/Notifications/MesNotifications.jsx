import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../api/notificationApi';
import { FaBell, FaTrash } from 'react-icons/fa';
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
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mes notifications</h2>
        {notifications.length > 0 && (
          <button className="btn btn-danger" onClick={handleDeleteAll}>
            <FaTrash className="me-2" /> Tout supprimer
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-muted py-5">
          <FaBell size={48} className="mb-3" />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="list-group">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">
                  {notif.sujet}
                  <span className="badge bg-primary ms-2">{notif.type}</span>
                </div>
                <p className="mb-1">{notif.contenu}</p>
                <small className="text-muted">
                  {new Date(notif.dateCreation).toLocaleString()}
                  {notif.statut === 'ENVOYEE' ? (
                    <span className="badge bg-success ms-2">Envoyée</span>
                  ) : notif.statut === 'ECHEC' ? (
                    <span className="badge bg-danger ms-2">Échec</span>
                  ) : (
                    <span className="badge bg-warning ms-2">En attente</span>
                  )}
                </small>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(notif.id)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesNotifications;
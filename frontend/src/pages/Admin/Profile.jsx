// pages/Profile.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Vous devez être connecté pour voir votre profil.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FaUser className="me-2" />
                Mon Profil
              </h4>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-3 fw-bold">
                  <FaIdCard className="me-2" />
                  Nom complet
                </div>
                <div className="col-sm-9">
                  {user.prenom} {user.nom}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3 fw-bold">
                  <FaEnvelope className="me-2" />
                  Email
                </div>
                <div className="col-sm-9">
                  {user.email}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3 fw-bold">
                  <FaPhone className="me-2" />
                  Téléphone
                </div>
                <div className="col-sm-9">
                  {user.telephone || 'Non renseigné'}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3 fw-bold">Rôle</div>
                <div className="col-sm-9">
                  <span className="badge bg-info">
                    {user.roles?.join(', ') || 'Membre'}
                  </span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3 fw-bold">Statut</div>
                <div className="col-sm-9">
                  <span className={`badge ${user.actif ? 'bg-success' : 'bg-danger'}`}>
                    {user.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
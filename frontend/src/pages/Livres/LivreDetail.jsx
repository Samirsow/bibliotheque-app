import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { livreApi } from '../../api/livreApi';
import { empruntApi } from '../../api/empruntApi';
import { FaArrowLeft, FaHandshake, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const LivreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [livre, setLivre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emprunts, setEmprunts] = useState([]);

  useEffect(() => {
    fetchLivre();
    fetchEmprunts();
  }, [id]);

  const fetchLivre = async () => {
    try {
      const response = await livreApi.getById(id);
      setLivre(response.data);
    } catch (error) {
      toast.error('Livre non trouvé');
      navigate('/livres');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmprunts = async () => {
    try {
      const response = await empruntApi.getByLivre(id);
      setEmprunts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des emprunts:', error);
    }
  };

  const handleEmprunter = async () => {
    if (!user) {
      toast.warning('Veuillez vous connecter');
      navigate('/login');
      return;
    }

    try {
      await empruntApi.create({
        utilisateurId: user.id,
        livreId: livre.id
      });
      toast.success('Livre emprunté avec succès !');
      fetchLivre();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Impossible d\'emprunter ce livre');
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (!livre) {
    return <div className="text-center">Livre non trouvé</div>;
  }

  return (
    <div>
      <Link to="/livres" className="btn btn-outline-secondary mb-4">
        <FaArrowLeft className="me-2" /> Retour à la liste
      </Link>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h2>{livre.titre}</h2>
              <p className="text-muted">Par {livre.auteur}</p>
              <p><strong>ISBN:</strong> {livre.isbn}</p>
              <p><strong>Éditeur:</strong> {livre.editeur}</p>
              <p><strong>Année:</strong> {livre.anneePublication}</p>
              <p><strong>Catégorie:</strong> {livre.categorie}</p>
              <p><strong>Description:</strong></p>
              <p className="text-justify">{livre.description || 'Aucune description'}</p>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">Disponibilité</h5>
                  <p><FaBook className="me-2" />
                    Exemplaires: {livre.nombreExemplaires}
                  </p>
                  <p className="text-success">
                    Disponibles: {livre.nombreDisponibles}
                  </p>
                  <p className="text-muted">
                    Statut: {livre.statut}
                  </p>
                  <button
                    className="btn btn-success w-100"
                    onClick={handleEmprunter}
                    disabled={livre.nombreDisponibles === 0}
                  >
                    <FaHandshake className="me-2" />
                    {livre.nombreDisponibles === 0 ? 'Indisponible' : 'Emprunter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {emprunts.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Historique des emprunts</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Date emprunt</th>
                    <th>Date retour prévue</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {emprunts.map((emprunt) => (
                    <tr key={emprunt.id}>
                      <td>{emprunt.utilisateurId}</td>
                      <td>{new Date(emprunt.dateEmprunt).toLocaleDateString()}</td>
                      <td>{new Date(emprunt.dateRetourPrevue).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${emprunt.statut === 'RETOURNE' ? 'bg-success' : 'bg-warning'}`}>
                          {emprunt.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivreDetail;
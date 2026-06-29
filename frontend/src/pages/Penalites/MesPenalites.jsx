import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { penaliteApi } from '../../api/penaliteApi';
import { FaMoneyBillWave, FaEuroSign } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MesPenalites = () => {
  const { user } = useAuth();
  const [penalites, setPenalites] = useState([]);
  const [totalImpaye, setTotalImpaye] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPenalites();
    }
  }, [user]);

  const fetchPenalites = async () => {
    try {
      const [penalitesResponse, totalResponse] = await Promise.all([
        penaliteApi.getByUtilisateur(user.id),
        penaliteApi.getTotalImpaye(user.id)
      ]);
      setPenalites(penalitesResponse.data);
      setTotalImpaye(totalResponse.data.totalImpaye || 0);
    } catch (error) {
      toast.error('Erreur lors du chargement des pénalités');
    } finally {
      setLoading(false);
    }
  };

  const handlePayer = async (penaliteId) => {
    try {
      await penaliteApi.payer({
        penaliteId,
        modePaiement: 'CARTE',
        transactionId: `TXN-${Date.now()}`
      });
      toast.success('Pénalité payée avec succès !');
      fetchPenalites();
    } catch (error) {
      toast.error('Erreur lors du paiement');
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Mes pénalités</h2>

      <div className="card bg-warning text-dark mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <FaEuroSign className="me-2" />
            Total impayé: {totalImpaye.toFixed(2)}F        </h5>
        </div>
      </div>

      {penalites.length === 0 ? (
        <div className="text-center text-muted py-5">
          <FaMoneyBillWave size={48} className="mb-3" />
          <p>Aucune pénalité</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Emprunt</th>
                <th>Jours de retard</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((penalite) => (
                <tr key={penalite.id}>
                  <td>{penalite.id}</td>
                  <td>#{penalite.empruntId}</td>
                  <td>{penalite.joursRetard}</td>
                  <td>{penalite.montant.toFixed(2)} F</td>
                  <td>
                    <span className={`badge ${penalite.statut === 'PAYE' ? 'bg-success' : 'bg-danger'}`}>
                      {penalite.statut}
                    </span>
                  </td>
                  <td>
                    {penalite.statut === 'IMPAYE' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePayer(penalite.id)}
                      >
                        <FaEuroSign className="me-1" /> Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MesPenalites;
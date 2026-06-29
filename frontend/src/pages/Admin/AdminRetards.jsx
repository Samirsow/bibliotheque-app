import React, { useState, useEffect } from 'react';
import { adminPenalitesApi } from '../../api/adminPenalitesApi';
import { toast } from 'react-toastify';
import BoutonRetour from '../../components/Layout/BoutonRetour';
import {
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCheckCircle,
} from 'react-icons/fa';

const AdminRetards = () => {
  const [retards, setRetards] = useState([]);
  const [penalites, setPenalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [resRetards, resPenalites] = await Promise.all([
        adminPenalitesApi.getPretsEnRetard(),
        adminPenalitesApi.getPenalitesImpayees(),
      ]);
      setRetards(resRetards.data);
      setPenalites(resPenalites.data);
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Impossible de charger les données'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayer = async (penalite) => {
    if (!window.confirm(`Confirmer le paiement de ${penalite.montant.toFixed(2)} € ?`))
      return;
    setPayingId(penalite.id);
    try {
      await adminPenalitesApi.payerPenalite(
        penalite.id,
        `MANUEL-${Date.now()}`
      );
      toast.success('Pénalité marquée comme payée');
      chargerDonnees();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Paiement impossible');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="container py-4">
      <BoutonRetour to="/admin/utilisateurs" label="Retour" />

      <h1 className="h3 fw-bold d-flex align-items-center gap-2 mb-4">
        <FaExclamationTriangle className="text-warning" />
        Retards &amp; pénalités
      </h1>

      {loading ? (
        <p className="text-center text-muted py-5">Chargement…</p>
      ) : (
        <div className="row g-4">
          {/* Prêts en retard */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center justify-content-between bg-white">
                <span className="fw-semibold">Prêts en retard</span>
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  {retards.length}
                </span>
              </div>
              <div className="card-body p-0">
                {retards.length === 0 ? (
                  <p className="text-center text-muted py-4 small mb-0">
                    Aucun retard en cours.
                  </p>
                ) : (
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Emprunt</th>
                        <th>Utilisateur</th>
                        <th>Livre</th>
                        <th>Retour prévu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retards.map((r) => (
                        <tr key={r.id}>
                          <td className="font-monospace text-muted">#{r.id}</td>
                          <td className="font-monospace text-muted">{r.utilisateurId}</td>
                          <td className="font-monospace text-muted">{r.livreId}</td>
                          <td className="font-monospace text-danger">
                            {r.dateRetourPrevue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Pénalités impayées */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center justify-content-between bg-white">
                <span className="fw-semibold">Pénalités impayées</span>
                <span className="badge bg-danger-subtle text-danger-emphasis">
                  {penalites.length}
                </span>
              </div>
              <div className="card-body p-0">
                {penalites.length === 0 ? (
                  <div className="text-center text-muted py-4 small">
                    <FaCheckCircle className="text-success mb-2" size={20} />
                    <p className="mb-0">Aucune pénalité impayée.</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {penalites.map((p) => (
                      <li
                        key={p.id}
                        className="list-group-item d-flex align-items-center justify-content-between"
                      >
                        <div>
                          <p className="fw-bold text-danger mb-0">
                            {p.montant.toFixed(2)} €
                          </p>
                          <p className="small text-muted mb-0">
                            Utilisateur{' '}
                            <span className="font-monospace">{p.utilisateurId}</span>{' '}
                            · {p.joursRetard} j de retard
                          </p>
                        </div>
                        <button
                          onClick={() => handlePayer(p)}
                          disabled={payingId === p.id}
                          className="btn btn-sm btn-success d-flex align-items-center gap-2"
                        >
                          <FaMoneyBillWave />
                          {payingId === p.id ? 'Paiement…' : 'Marquer payée'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRetards;
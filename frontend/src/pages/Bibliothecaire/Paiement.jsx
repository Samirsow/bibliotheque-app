import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { FaMoneyCheckAlt, FaCheckCircle } from 'react-icons/fa';

const Paiements = () => {
  const [penalites, setPenalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await bibliothecaireApi.getPenalitesImpayees();
      setPenalites(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderPaiement = async (penalite) => {
    if (!window.confirm(`Confirmer le paiement de ${penalite.montant.toFixed(2)} € ?`)) return;
    setPayingId(penalite.id);
    try {
      await bibliothecaireApi.validerPaiement(penalite.id, `BIB-${Date.now()}`);
      toast.success('Paiement validé');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation impossible');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <h2 className="h4 fw-bold mb-4">Valider un paiement</h2>

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : penalites.length === 0 ? (
            <div className="text-center text-muted py-5">
              <FaCheckCircle className="text-success mb-2" size={24} />
              <p className="mb-0">Aucune pénalité impayée.</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {penalites.map((p) => (
                <li key={p.id} className="list-group-item d-flex align-items-center justify-content-between">
                  <div>
                    <p className="fw-bold text-danger mb-0">{p.montant.toFixed(2)} €</p>
                    <p className="small text-muted mb-0">
                      Membre <span className="font-monospace">{p.utilisateurId}</span> ·{' '}
                      {p.joursRetard} j de retard
                    </p>
                  </div>
                  <button
                    onClick={() => handleValiderPaiement(p)}
                    disabled={payingId === p.id}
                    className="btn btn-sm btn-success d-flex align-items-center gap-2"
                  >
                    <FaMoneyCheckAlt />
                    {payingId === p.id ? 'Validation…' : 'Valider le paiement'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paiements;
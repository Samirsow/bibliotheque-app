import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { FaUndo } from 'react-icons/fa';

const Retours = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await bibliothecaireApi.getAllEmprunts();
      setEmprunts(res.data.filter((e) => e.statut === 'EN_COURS' || e.statut === 'EN_RETARD'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderRetour = async (emprunt) => {
    setReturningId(emprunt.id);
    try {
      const result = await bibliothecaireApi.validerRetour(emprunt.id);
      const msg =
        result.data.montantPenalite > 0
          ? `Retour validé. ${result.data.joursRetard} j de retard — pénalité ${result.data.montantPenalite.toFixed(2)} €.`
          : 'Retour validé, sans pénalité.';
      toast.success(msg);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation impossible');
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div>
      <h2 className="h4 fw-bold mb-4">Valider un retour</h2>

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement...</p>
          ) : emprunts.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">Aucun emprunt à retourner.</p>
          ) : (
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Emprunt</th>
                  <th>Membre</th>
                  <th>Livre</th>
                  <th>Retour prévu</th>
                  <th>Statut</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map((e) => (
                  <tr key={e.id}>
                    <td className="font-monospace text-muted">#{e.id}</td>
                    <td>
                      {e.utilisateurPrenom || e.utilisateurNom
                        ? `${e.utilisateurPrenom ?? ''} ${e.utilisateurNom ?? ''}`.trim()
                        : `Utilisateur #${e.utilisateurId}`}
                    </td>
                    <td>{e.livreTitre || `Livre #${e.livreId}`}</td>
                    <td className="font-monospace">{e.dateRetourPrevue}</td>
                    <td>
                      <span
                        className={`badge ${
                          e.statut === 'EN_RETARD'
                            ? 'bg-danger-subtle text-danger-emphasis'
                            : 'bg-primary-subtle text-primary-emphasis'
                        }`}
                      >
                        {e.statut === 'EN_RETARD' ? 'En retard' : 'En cours'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleValiderRetour(e)}
                        disabled={returningId === e.id}
                        className="btn btn-sm btn-success d-flex align-items-center gap-2 ms-auto"
                      >
                        <FaUndo />
                        {returningId === e.id ? 'Validation...' : 'Valider le retour'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Retours;
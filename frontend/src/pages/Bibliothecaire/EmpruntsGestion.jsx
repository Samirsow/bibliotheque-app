import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';

const DELAI_JOURS = 14;

const EmpruntsGestion = () => {
  const [membres, setMembres] = useState([]);
  const [livres, setLivres] = useState([]);
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ utilisateurId: '', livreId: '', dateRetourPrevue: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const [resMembres, resLivres, resEmprunts] = await Promise.all([
        bibliothecaireApi.getMembres(),
        bibliothecaireApi.getLivres(),
        bibliothecaireApi.getAllEmprunts(),
      ]);
      setMembres(resMembres.data);
      setLivres(resLivres.data.filter((l) => l.nombreDisponibles > 0));
      setEmprunts(resEmprunts.data);

      const dateDefaut = new Date(Date.now() + DELAI_JOURS * 86400000)
        .toISOString()
        .slice(0, 10);
      setForm((f) => ({ ...f, dateRetourPrevue: dateDefaut }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bibliothecaireApi.creerEmprunt(
        Number(form.utilisateurId),
        Number(form.livreId),
        form.dateRetourPrevue
      );
      toast.success('Emprunt enregistré');
      setForm((f) => ({ ...f, utilisateurId: '', livreId: '' }));
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Emprunt impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const enCours = emprunts.filter((e) => e.statut !== 'RETOURNE');

  return (
    <div>
      <h2 className="h4 fw-bold mb-4">Enregistrer un emprunt</h2>

      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small text-muted">Membre</label>
            <select
              name="utilisateurId"
              value={form.utilisateurId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Sélectionner…</option>
              {membres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.prenom} {m.nom} ({m.email})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Livre disponible</label>
            <select
              name="livreId"
              value={form.livreId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Sélectionner…</option>
              {livres.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.titre} ({l.nombreDisponibles} dispo.)
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Date de retour prévue</label>
            <input
              type="date"
              name="dateRetourPrevue"
              value={form.dateRetourPrevue}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-12">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Enregistrement…' : "Enregistrer l'emprunt"}
            </button>
          </div>
        </div>
      </form>

      <h2 className="h5 fw-bold mb-3">Emprunts en cours ({enCours.length})</h2>
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : enCours.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">Aucun emprunt en cours.</p>
          ) : (
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Emprunt</th>
                  <th>Membre</th>
                  <th>Livre</th>
                  <th>Retour prévu</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {enCours.map((e) => (
                  <tr key={e.id}>
                    <td className="font-monospace text-muted">#{e.id}</td>
                    <td className="font-monospace text-muted">{e.utilisateurId}</td>
                    <td className="font-monospace text-muted">{e.livreId}</td>
                    <td className="font-monospace">{e.dateRetourPrevue}</td>
                    <td>
                      <span
                        className={`badge ${
                          e.statut === 'EN_RETARD'
                            ? 'bg-danger-subtle text-danger-emphasis'
                            : 'bg-primary-subtle text-primary-emphasis'
                        }`}
                      >
                        {e.statut}
                      </span>
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

export default EmpruntsGestion;
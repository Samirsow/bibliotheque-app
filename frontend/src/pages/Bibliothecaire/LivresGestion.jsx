import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';

const LivresGestion = () => {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await bibliothecaireApi.getLivres();
      setLivres(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    setActionId(id);
    try {
      await bibliothecaireApi.supprimerLivre(id);
      toast.success('Livre supprimé');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold mb-0">Livres</h2>
        <button
          className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} d-flex align-items-center gap-2`}
          onClick={() => { setEditing(null); setShowForm((v) => !v); }}
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? 'Annuler' : 'Ajouter un livre'}
        </button>
      </div>

      {showForm && (
        <LivreForm
          livre={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            charger();
          }}
        />
      )}

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : (
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Catégorie</th>
                  <th>Disponibles</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {livres.map((l) => (
                  <tr key={l.id}>
                    <td className="fw-medium">{l.titre}</td>
                    <td className="text-muted">{l.auteur}</td>
                    <td className="text-muted">{l.categorie}</td>
                    <td className="font-monospace">
                      {l.nombreDisponibles}/{l.nombreExemplaires}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          l.statut === 'DISPONIBLE'
                            ? 'bg-success-subtle text-success-emphasis'
                            : 'bg-secondary-subtle text-secondary-emphasis'
                        }`}
                      >
                        {l.statut}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => { setEditing(l); setShowForm(true); }}
                          className="btn btn-sm btn-outline-primary"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleSupprimer(l.id)}
                          disabled={actionId === l.id}
                          className="btn btn-sm btn-outline-danger"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
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

const LivreForm = ({ livre, onSaved }) => {
  const [form, setForm] = useState({
    titre: livre?.titre || '',
    auteur: livre?.auteur || '',
    isbn: livre?.isbn || '',
    editeur: livre?.editeur || '',
    anneePublication: livre?.anneePublication || '',
    categorie: livre?.categorie || '',
    nombreExemplaires: livre?.nombreExemplaires || 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (livre) {
        await bibliothecaireApi.modifierLivre(livre.id, form);
        toast.success('Livre modifié');
      } else {
        await bibliothecaireApi.creerLivre({
          ...form,
          nombreExemplaires: Number(form.nombreExemplaires),
          nombreDisponibles: Number(form.nombreExemplaires),
        });
        toast.success('Livre ajouté');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4">
      <div className="row g-3">
        <div className="col-md-4">
          <input name="titre" placeholder="Titre" value={form.titre} onChange={handleChange} required className="form-control" />
        </div>
        <div className="col-md-4">
          <input name="auteur" placeholder="Auteur" value={form.auteur} onChange={handleChange} required className="form-control" />
        </div>
        <div className="col-md-4">
          <input name="isbn" placeholder="ISBN (sans tirets)" value={form.isbn} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <input name="editeur" placeholder="Éditeur" value={form.editeur} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <input type="number" name="anneePublication" placeholder="Année" value={form.anneePublication} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <input name="categorie" placeholder="Catégorie" value={form.categorie} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <input
            type="number"
            min="1"
            name="nombreExemplaires"
            placeholder="Exemplaires"
            value={form.nombreExemplaires}
            onChange={handleChange}
            required
            disabled={!!livre}
            className="form-control"
          />
        </div>
        <div className="col-12">
          <button type="submit" disabled={submitting} className="btn btn-primary w-100">
            {submitting ? 'Enregistrement…' : livre ? 'Modifier le livre' : 'Ajouter au catalogue'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LivresGestion;
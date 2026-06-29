// pages/Bibliothecaire/DemandesEnAttente.jsx
import React, { useState, useEffect } from 'react';
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaClock, FaUser, FaBook, FaSync, FaExclamationTriangle } from 'react-icons/fa';

// ✅ Extrait le nom du membre, peu importe la forme exacte renvoyée par le backend
const getNomMembre = (d) => {
    const prenom = d.utilisateurPrenom ?? d.prenom ?? '';
    const nom = d.utilisateurNom ?? d.nom ?? '';
    const complet = `${prenom} ${nom}`.trim();
    return complet || `Utilisateur #${d.utilisateurId ?? '?'}`;
};

const getEmailMembre = (d) => d.utilisateurEmail ?? d.email ?? '';

const getTitreLivre = (d) => d.livreTitre ?? d.titre ?? `Livre #${d.livreId ?? '?'}`;

const getAuteurLivre = (d) => d.livreAuteur ?? d.auteur ?? '';

const DemandesEnAttente = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        chargerDemandes();
    }, []);

    const chargerDemandes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await bibliothecaireApi.getDemandesEnAttente();
            // ✅ Log de la structure réelle reçue, utile pour diagnostiquer
            console.log('📦 Structure brute reçue:', JSON.stringify(response.data, null, 2));

            if (response?.data && Array.isArray(response.data)) {
                setDemandes(response.data);
            } else {
                setDemandes([]);
            }
        } catch (err) {
            console.error('❌ Erreur détaillée:', err);
            setError(err.message || 'Erreur de chargement');

            if (err.response) {
                if (err.response.status === 404) {
                    toast.error("🔍 Endpoint non trouvé. Vérifiez l'URL");
                } else if (err.response.status === 403) {
                    toast.error('🔒 Accès non autorisé');
                } else if (err.response.status === 500) {
                    toast.error('💥 Erreur serveur. Vérifiez les logs backend');
                } else {
                    toast.error(`❌ Erreur ${err.response.status}`);
                }
            } else if (err.request) {
                toast.error('🌐 Impossible de contacter le serveur');
            } else {
                toast.error('❌ ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async (id) => {
        setActionId(id);
        try {
            await bibliothecaireApi.validerEmprunt(id);
            toast.success('✅ Emprunt validé avec succès !');
            await chargerDemandes();
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Validation impossible');
        } finally {
            setActionId(null);
        }
    };

    const handleRefuser = async (id) => {
        if (!window.confirm('Confirmer le refus de cette demande ?')) return;
        setActionId(id);
        try {
            await bibliothecaireApi.refuserEmprunt(id, 'Refusé par le bibliothécaire');
            toast.warning('❌ Demande refusée');
            await chargerDemandes();
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Refus impossible');
        } finally {
            setActionId(null);
        }
    };

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">
                    <h5><FaExclamationTriangle className="me-2" /> Erreur de chargement</h5>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={chargerDemandes}>
                        <FaSync className="me-2" /> Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 fw-bold mb-0">
                    <FaClock className="text-warning me-2" />
                    Demandes d'emprunt en attente 
                    {demandes.length > 0 && (
                        <span className="badge bg-warning ms-2">{demandes.length}</span>
                    )}
                </h2>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={chargerDemandes}
                    disabled={loading}
                >
                    <FaSync className="me-1" />
                    Actualiser
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="text-muted mt-2">Chargement des demandes...</p>
                        </div>
                    ) : demandes.length === 0 ? (
                        <div className="text-center py-5">
                            <FaClock size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">Aucune demande en attente</p>
                            <small className="text-muted">Toutes les demandes ont été traitées</small>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Membre</th>
                                        <th>Livre</th>
                                        <th>Date demande</th>
                                        <th>Retour prévu</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demandes.map((d) => (
                                        <tr key={d.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FaUser className="text-muted me-2" />
                                                    <div>
                                                        <span className="fw-medium">{getNomMembre(d)}</span>
                                                        <br />
                                                        <small className="text-muted">{getEmailMembre(d)}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FaBook className="text-muted me-2" />
                                                    <div>
                                                        <span className="fw-medium">{getTitreLivre(d)}</span>
                                                        <br />
                                                        <small className="text-muted">{getAuteurLivre(d)}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {d.dateEmprunt
                                                    ? new Date(d.dateEmprunt).toLocaleDateString('fr-FR')
                                                    : '-'}
                                            </td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {d.dateRetourPrevue
                                                        ? new Date(d.dateRetourPrevue).toLocaleDateString('fr-FR')
                                                        : '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleValider(d.id)}
                                                        disabled={actionId === d.id}
                                                        title="Valider la demande"
                                                    >
                                                        {actionId === d.id ? (
                                                            <span className="spinner-border spinner-border-sm" />
                                                        ) : (
                                                            <FaCheck />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleRefuser(d.id)}
                                                        disabled={actionId === d.id}
                                                        title="Refuser la demande"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemandesEnAttente;
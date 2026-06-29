// pages/Emprunts/NouvelEmprunt.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { empruntApi } from '../../api/empruntApi'; // ✅ Utiliser empruntApi au lieu de membreApi
import { bibliothecaireApi } from '../../api/bibliothecaireApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaBook, FaCalendar, FaArrowLeft } from 'react-icons/fa';

const NouvelEmprunt = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [livres, setLivres] = useState([]);
    const [selectedLivre, setSelectedLivre] = useState('');
    const [dateRetour, setDateRetour] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // ✅ Vérifier si l'utilisateur est connecté
        if (!isAuthenticated()) {
            toast.warning('Veuillez vous connecter');
            navigate('/login');
            return;
        }
        chargerLivresDisponibles();
    }, []);

    const chargerLivresDisponibles = async () => {
        setLoading(true);
        try {
            const res = await bibliothecaireApi.getLivres();
            // ✅ Filtrer les livres disponibles
            const disponibles = res.data.filter(l => l.nombreDisponibles > 0);
            setLivres(disponibles);
            
            if (disponibles.length === 0) {
                toast.info('Aucun livre disponible actuellement');
            }
        } catch (error) {
            console.error('Erreur chargement livres:', error);
            toast.error('Impossible de charger les livres');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Calculer la date minimum (J+1)
    const getDateMin = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    // ✅ Calculer la date maximum (J+14)
    const getDateMax = () => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedLivre) {
            toast.warning('Veuillez sélectionner un livre');
            return;
        }
        
        if (!dateRetour) {
            toast.warning('Veuillez choisir une date de retour');
            return;
        }

        // ✅ Vérifier que la date est valide
        const dateMin = new Date(getDateMin());
        const dateMax = new Date(getDateMax());
        const dateChoisie = new Date(dateRetour);
        
        if (dateChoisie < dateMin) {
            toast.warning('La date de retour doit être au moins demain');
            return;
        }
        if (dateChoisie > dateMax) {
            toast.warning('La durée de prêt ne peut pas dépasser 14 jours');
            return;
        }

        setSubmitting(true);
        try {
            // ✅ Utiliser empruntApi au lieu de membreApi
            const response = await empruntApi.demanderEmprunt(selectedLivre, dateRetour);
            console.log('✅ Réponse:', response.data);
            
            toast.success('✅ Demande d\'emprunt envoyée ! En attente de validation.');
            navigate('/emprunts');
        } catch (error) {
            console.error('❌ Erreur:', error);
            
            // ✅ Gestion des erreurs détaillée
            if (error.response?.status === 401) {
                toast.error('Veuillez vous reconnecter');
                navigate('/login');
            } else if (error.response?.status === 403) {
                toast.error('Vous n\'avez pas les droits nécessaires');
            } else if (error.response?.status === 404) {
                toast.error('Service d\'emprunt indisponible');
            } else {
                toast.error(error.response?.data?.message || 'Demande impossible');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Afficher le livre sélectionné
    const livreSelectionne = livres.find(l => l.id === parseInt(selectedLivre));

    return (
        <div className="container py-4">
            {/* ✅ Bouton retour */}
            <button 
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate('/livres')}
            >
                <FaArrowLeft className="me-2" /> Retour aux livres
            </button>

            <h2 className="h4 fw-bold mb-4">
                <FaBook className="me-2" />
                Demander un emprunt
            </h2>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" />
                                    <p className="text-muted mt-2">Chargement des livres...</p>
                                </div>
                            ) : livres.length === 0 ? (
                                <div className="text-center py-4">
                                    <FaBook size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Aucun livre disponible</p>
                                    <small className="text-muted">Revenez plus tard</small>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {/* ✅ Sélection du livre */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <FaBook className="me-2" />
                                            Livre à emprunter
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            value={selectedLivre}
                                            onChange={(e) => setSelectedLivre(e.target.value)}
                                            required
                                        >
                                            <option value="">Sélectionner un livre...</option>
                                            {livres.map((l) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.titre} - {l.auteur} ({l.nombreDisponibles} disponible{l.nombreDisponibles > 1 ? 's' : ''})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ✅ Affichage des infos du livre sélectionné */}
                                    {livreSelectionne && (
                                        <div className="alert alert-info">
                                            <h6 className="fw-bold">{livreSelectionne.titre}</h6>
                                            <p className="mb-1">Auteur: {livreSelectionne.auteur}</p>
                                            <p className="mb-0">
                                                Disponibles: <strong>{livreSelectionne.nombreDisponibles}</strong>
                                            </p>
                                        </div>
                                    )}

                                    {/* ✅ Date de retour */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <FaCalendar className="me-2" />
                                            Date de retour prévue
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateRetour}
                                            onChange={(e) => setDateRetour(e.target.value)}
                                            min={getDateMin()}
                                            max={getDateMax()}
                                            required
                                        />
                                        <small className="text-muted">
                                            📅 Durée maximale : 14 jours (du {new Date(getDateMin()).toLocaleDateString('fr-FR')} au {new Date(getDateMax()).toLocaleDateString('fr-FR')})
                                        </small>
                                    </div>

                                    {/* ✅ Information sur la validation */}
                                    <div className="alert alert-warning">
                                        <FaClock className="me-2" />
                                        <strong>Information :</strong> Votre demande sera examinée par un bibliothécaire. 
                                        Le statut passera à "En cours" une fois validée.
                                    </div>

                                    {/* ✅ Bouton de soumission */}
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-lg w-100"
                                        disabled={submitting || !selectedLivre || !dateRetour}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <FaClock className="me-2" />
                                                Demander l'emprunt
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* ✅ Sidebar d'information */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold">📋 Informations</h6>
                            <hr />
                            <div className="mb-2">
                                <small className="text-muted">Statut de la demande</small>
                                <p className="mb-0">
                                    <span className="badge bg-warning">⏳ En attente de validation</span>
                                </p>
                            </div>
                            <div className="mb-2">
                                <small className="text-muted">Durée de prêt</small>
                                <p className="mb-0">14 jours maximum</p>
                            </div>
                            <div>
                                <small className="text-muted">Pénalités</small>
                                <p className="mb-0">0.50f par jour de retard</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NouvelEmprunt;
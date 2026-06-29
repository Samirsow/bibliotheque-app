// src/api/membreApi.js
import apiClient from './axiosConfig';

export const membreApi = {
  demanderEmprunt: (livreId, dateRetourPrevue) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return apiClient.post('/gestionemprunt/api/emprunts/demande', {
      utilisateurId: user.id,
      livreId,
      dateRetourPrevue,
    });
  },
  // ✅ Supprimer un emprunt retourné de l'historique
supprimerEmprunt: (empruntId) =>
    apiClient.delete(`/gestionemprunt/api/emprunts/${empruntId}`),

  getMesEmprunts: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return apiClient.post('/gestionemprunt/api/emprunts/mes-emprunts', {
      utilisateurId: user.id,
    });
  },
};
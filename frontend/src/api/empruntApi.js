import apiClient from './axiosConfig';

export const empruntApi = {
  // ✅ Corrigé : utilise apiClient au lieu de fetch cassé
  getAll: () =>
    apiClient.get('/gestionemprunt/api/emprunts'),

  // ✅ Corrigé : préfixe + utilisateurId injecté automatiquement
  demanderEmprunt: (livreId, dateRetourPrevue) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return apiClient.post('/gestionemprunt/api/emprunts/demande', {
      utilisateurId: user.id,
      livreId,
      dateRetourPrevue,
    });
  },

  // ✅ Corrigé : POST avec body, comme attendu par le backend
  getMesEmprunts: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('📤 Récupération des emprunts du membre...');
    return apiClient
      .post('/gestionemprunt/api/emprunts/mes-emprunts', { utilisateurId: user.id })
      .then((response) => {
        console.log('📥 Emprunts reçus:', response.data);
        return response;
      })
      .catch((error) => {
        console.error('❌ Erreur getMesEmprunts:', error);
        throw error;
      });
  },

  getByUtilisateur: (utilisateurId) =>
    apiClient.get(`/gestionemprunt/api/emprunts/utilisateur/${utilisateurId}`),

  getByLivre: (livreId) =>
    apiClient.get(`/gestionemprunt/api/emprunts/livre/${livreId}`),

  create: (data) =>
    apiClient.post('/gestionemprunt/api/emprunts', data),

  retourner: (id, dateRetour) =>
    apiClient.put(`/gestionemprunt/api/emprunts/retour/${id}${dateRetour ? `?dateRetour=${dateRetour}` : ''}`),

  getEnRetard: () =>
    apiClient.get('/gestionemprunt/api/emprunts/retards'),
};